import { getFullSlug, pathToRoot, joinSegments, FullSlug } from "../../util/path"

// Lightweight loader that defers the heavy graph bundle (pixi.js + d3 ~400KB
// minified) until the graph is about to be seen or the main thread is idle.
//
// The real graph script (graph.inline.ts) is emitted as static/graph.js by
// the LazyScripts emitter. Once loaded, we re-dispatch the `nav` event so the
// graph renders against the current slug.

declare global {
  interface Window {
    __graphLazyLoaded?: boolean
    __graphLazyCurrentSlug?: FullSlug
  }
}

function computeStaticPath(): string {
  const root = pathToRoot(getFullSlug(window))
  return joinSegments(root, "static/graph.js")
}

function triggerLoad() {
  if (window.__graphLazyLoaded) return
  window.__graphLazyLoaded = true
  const s = document.createElement("script")
  s.src = computeStaticPath()
  s.defer = true
  s.onload = () => {
    const slug = window.__graphLazyCurrentSlug ?? (getFullSlug(window) as FullSlug)
    document.dispatchEvent(new CustomEvent("nav", { detail: { url: slug } }))
  }
  document.head.appendChild(s)
}

document.addEventListener("nav", (e: CustomEventMap["nav"]) => {
  window.__graphLazyCurrentSlug = e.detail.url
  if (window.__graphLazyLoaded) return

  const containers = Array.from(
    document.querySelectorAll<HTMLElement>(".graph-container"),
  )
  if (containers.length === 0) return

  let triggered = false
  const schedule = () => {
    if (triggered) return
    triggered = true
    triggerLoad()
  }

  // Sidebar-only mini-graphs cost ~3s of pixi eval on Safari for a
  // decorative view; require user intent there. Landing's hero graph
  // (not inside .sidebar) still auto-loads on intersection + idle.
  const primary = containers.find((el) => !el.closest(".sidebar")) ?? null

  if (primary) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            io.disconnect()
            schedule()
          }
        },
        { rootMargin: "200px" },
      )
      io.observe(primary)
      window.addCleanup(() => io.disconnect())
    }

    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined
    ric?.(schedule, { timeout: 3000 })
  }

  const sidebarGraphs = containers.filter((el) => el.closest(".sidebar"))
  for (const g of sidebarGraphs) {
    const activate = () => schedule()
    g.addEventListener("click", activate, { once: true })
    g.addEventListener("touchstart", activate, { once: true, passive: true })
    g.addEventListener("mouseenter", activate, { once: true })
    g.style.cursor = "pointer"
  }

  const onUserIntent = () => schedule()
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && ev.key === "g") onUserIntent()
  })
  for (const icon of document.getElementsByClassName("global-graph-icon")) {
    icon.addEventListener("click", onUserIntent, { once: true })
  }
})
