type Family = "Serif" | "Sans" | "Mono"
type Theme = "light" | "dark"

const STORAGE = {
  open: "tweaks:open",
  family: "tweaks:family",
  size: "tweaks:size",
  leading: "tweaks:leading",
  measure: "tweaks:measure",
} as const

const DEFAULTS = { family: "Serif" as Family, size: 18, leading: 1.7, measure: 680 }
const FAMILY_VAR: Record<Family, string> = {
  Serif: "'Source Serif 4', 'Iowan Old Style', Georgia, 'Times New Roman', serif",
  Sans: "'Inter', system-ui, -apple-system, sans-serif",
  Mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
}

function applySettings() {
  const family = (localStorage.getItem(STORAGE.family) as Family | null) ?? DEFAULTS.family
  const size = Number(localStorage.getItem(STORAGE.size) ?? DEFAULTS.size)
  const leading = Number(localStorage.getItem(STORAGE.leading) ?? DEFAULTS.leading)
  const measure = Number(localStorage.getItem(STORAGE.measure) ?? DEFAULTS.measure)

  const root = document.documentElement
  root.style.setProperty("--font-body", FAMILY_VAR[family] ?? FAMILY_VAR.Serif)
  root.style.setProperty("--reader-size", `${size}px`)
  root.style.setProperty("--reader-leading", String(leading))
  root.style.setProperty("--reader-measure", `${measure}px`)
}

// Apply on first load so there's no flash
applySettings()

document.addEventListener("nav", () => {
  const panel = document.getElementById("tweaks-panel")
  const toggle = document.getElementById("tweaks-toggle")
  const closeBtn = document.getElementById("tweaks-close")
  if (!panel || !toggle) return

  applySettings()

  const setOpen = (open: boolean) => {
    panel.classList.toggle("open", open)
    toggle.classList.toggle("hidden", open)
    localStorage.setItem(STORAGE.open, open ? "1" : "0")
  }
  setOpen(localStorage.getItem(STORAGE.open) === "1")

  const onToggle = () => setOpen(!panel.classList.contains("open"))
  const onClose = () => setOpen(false)
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === ".") {
      e.preventDefault()
      onToggle()
    } else if (e.key === "Escape" && panel.classList.contains("open")) {
      setOpen(false)
    }
  }
  toggle.addEventListener("click", onToggle)
  closeBtn?.addEventListener("click", onClose)
  window.addEventListener("keydown", onKey)
  window.addCleanup(() => toggle.removeEventListener("click", onToggle))
  window.addCleanup(() => closeBtn?.removeEventListener("click", onClose))
  window.addCleanup(() => window.removeEventListener("keydown", onKey))

  // Theme seg
  const savedTheme = (document.documentElement.getAttribute("saved-theme") as Theme) ?? "light"
  const themeSeg = panel.querySelectorAll<HTMLButtonElement>("[data-theme]")
  const setThemeUI = (t: Theme) => themeSeg.forEach((b) => b.classList.toggle("on", b.dataset.theme === t))
  setThemeUI(savedTheme)

  const onThemeClick = (e: Event) => {
    const t = (e.currentTarget as HTMLElement).dataset.theme as Theme
    if (!t || t === document.documentElement.getAttribute("saved-theme")) return
    document.documentElement.setAttribute("saved-theme", t)
    localStorage.setItem("theme", t)
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }))
    setThemeUI(t)
  }
  themeSeg.forEach((b) => {
    b.addEventListener("click", onThemeClick)
    window.addCleanup(() => b.removeEventListener("click", onThemeClick))
  })
  const onThemeChange = (e: Event) => {
    const t = (e as CustomEvent).detail?.theme as Theme
    if (t) setThemeUI(t)
  }
  document.addEventListener("themechange", onThemeChange)
  window.addCleanup(() => document.removeEventListener("themechange", onThemeChange))

  // Family seg
  const famSeg = panel.querySelectorAll<HTMLButtonElement>("[data-family]")
  const currFam = (localStorage.getItem(STORAGE.family) as Family | null) ?? DEFAULTS.family
  const setFamilyUI = (f: Family) => {
    famSeg.forEach((b) => b.classList.toggle("on", b.dataset.family === f))
    const val = panel.querySelector("[data-val='family']") as HTMLElement | null
    if (val) val.textContent = f
  }
  setFamilyUI(currFam)
  const onFamilyClick = (e: Event) => {
    const f = (e.currentTarget as HTMLElement).dataset.family as Family
    if (!f) return
    localStorage.setItem(STORAGE.family, f)
    setFamilyUI(f)
    applySettings()
  }
  famSeg.forEach((b) => {
    b.addEventListener("click", onFamilyClick)
    window.addCleanup(() => b.removeEventListener("click", onFamilyClick))
  })

  // Sliders: size, leading, measure
  type Slider = { key: keyof typeof STORAGE; unit?: string; fmt?: (v: number) => string }
  const sliders: Slider[] = [
    { key: "size", unit: "px" },
    { key: "leading", fmt: (v) => v.toFixed(2) },
    { key: "measure", unit: "px" },
  ]
  sliders.forEach(({ key, unit, fmt }) => {
    const input = panel.querySelector<HTMLInputElement>(`[data-slider="${key}"]`)
    const val = panel.querySelector<HTMLElement>(`[data-val="${key}"]`)
    if (!input) return
    const current = localStorage.getItem(STORAGE[key]) ?? input.value
    input.value = current
    if (val) val.textContent = fmt ? fmt(Number(current)) : `${current}${unit ?? ""}`
    const onInput = () => {
      localStorage.setItem(STORAGE[key], input.value)
      if (val) val.textContent = fmt ? fmt(Number(input.value)) : `${input.value}${unit ?? ""}`
      applySettings()
    }
    input.addEventListener("input", onInput)
    window.addCleanup(() => input.removeEventListener("input", onInput))
  })
})
