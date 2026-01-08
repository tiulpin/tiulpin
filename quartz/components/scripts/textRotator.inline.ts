document.addEventListener("nav", () => {
  const container = document.getElementById("rotating-text")
  if (!container) return

  const texts = [
    "<strong>A living knowledge base: engineering notes, course archives, crossposts, and experiments.</strong> This is my third brain – a public wiki where I keep knowledge in one place.",
    "<strong>Жива база знань: інженерні нотатки, архіви курсів, кросспости та експерименти.</strong> Це мій третій мозок – публічна вікі, де я зберігаю знання в одному місці.",
    "<strong>O bază de cunoștințe vie: note de inginerie, arhive de cursuri, crossposturi și experimente.</strong> Aceasta este a treia mea minte – un wiki public unde păstrez cunoștințele într-un singur loc.",
    "<strong>Een levende kennisbank: technische notities, cursusarchieven, crossposts en experimenten.</strong> Dit is mijn derde brein – een openbare wiki waar ik kennis op één plek bewaar.",
    "<strong>Живая база знаний: инженерные заметки, архивы курсов, кросспосты и эксперименты.</strong> Это мой третий мозг – публичная вики, где я храню знания в одном месте.",
  ]

  let index = 0

  const interval = setInterval(() => {
    container.classList.add("slide-out")
    setTimeout(() => {
      index = (index + 1) % texts.length
      container.innerHTML = texts[index]
      container.classList.remove("slide-out")
      container.classList.add("slide-in")
      setTimeout(() => container.classList.remove("slide-in"), 400)
    }, 400)
  }, 4000)

  window.addCleanup(() => clearInterval(interval))

  const deck = document.getElementById("title-deck")
  const ankiFact = document.querySelector(".anki-fact") as HTMLElement
  if (!deck || !ankiFact) return

  const ankiFacts = [
    "Anki = spaced repetition magic",
    "You forget 70% in 24h without review",
    "20 min/day beats 3h cramming",
    "'Anki' means 'memorization' in Japanese",
    "Spaced repetition since 1885",
  ]

  let factIndex = Math.floor(Math.random() * ankiFacts.length)
  ankiFact.textContent = ankiFacts[factIndex]

  deck.addEventListener("click", () => {
    deck.classList.toggle("slide")
    if (deck.classList.contains("slide")) {
      factIndex = (factIndex + 1) % ankiFacts.length
      ankiFact.textContent = ankiFacts[factIndex]
    }
  })
})
