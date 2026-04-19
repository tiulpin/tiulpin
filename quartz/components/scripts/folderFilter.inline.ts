document.addEventListener("nav", () => {
  const archive = document.querySelector<HTMLElement>(".folder-archive")
  if (!archive) return

  const pills = archive.querySelectorAll<HTMLButtonElement>(".filter-pill")
  const rows = archive.querySelectorAll<HTMLElement>(".note-row")
  const groups = archive.querySelectorAll<HTMLElement>(".year-group")

  const apply = (tag: string) => {
    pills.forEach((p) => p.classList.toggle("active", p.dataset.filter === tag))
    rows.forEach((r) => {
      const tags = (r.dataset.tags ?? "").split(",").filter(Boolean)
      const visible = tag === "all" || tags.includes(tag)
      r.classList.toggle("hidden", !visible)
    })
    groups.forEach((g) => {
      const visible = g.querySelectorAll<HTMLElement>(".note-row:not(.hidden)").length
      g.classList.toggle("hidden", visible === 0)
      const countEl = g.querySelector<HTMLElement>(".year-count-visible")
      if (countEl) countEl.textContent = String(visible)
    })
  }

  const onClick = (e: Event) => {
    const t = (e.currentTarget as HTMLElement).dataset.filter
    if (t) apply(t)
  }

  pills.forEach((p) => {
    p.addEventListener("click", onClick)
    window.addCleanup(() => p.removeEventListener("click", onClick))
  })
})
