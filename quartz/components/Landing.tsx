import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
// @ts-ignore
import graphScript from "./scripts/graph.inline"
// @ts-ignore
import textRotatorScript from "./scripts/textRotator.inline"
import graphStyle from "./styles/graph.scss"
import { concatenateResources } from "../util/resources"

interface Options {
  limit: number
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: Options = {
  limit: 10,
  filter: (f) => f.slug?.startsWith("notes/") ?? false,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Landing: QuartzComponent = ({ allFiles, fileData, cfg, displayClass }: QuartzComponentProps) => {
    const notes = allFiles
      .filter(opts.filter)
      .filter((f) => !f.slug?.endsWith("/index"))
      .sort(byDateAndAlphabetical(cfg))
      .slice(0, opts.limit)

    return (
      <div class="landing">
        <section class="landing-header">
          <div class="title-deck" id="title-deck">
            <div class="deck-back">
              <span class="anki-fact">Anki makes you remember everything</span>
            </div>
            <div class="deck-front">
              <h1>VIKTOR'S<br/>NOTES</h1>
            </div>
          </div>
          <div class="landing-meta">
            <p>
              <span id="rotating-text"><strong>A living knowledge base: engineering notes, course archives, crossposts, and experiments.</strong> This is my third brain – a public wiki where I keep knowledge in one place.</span>
              <br />
              <a href="https://tiulp.in/">About me</a> · <a href="https://feed.tiulp.in/">Feed</a> · <a href="https://tiulp.in/cv">CV</a> · <a href="https://www.linkedin.com/in/tiulpin">LinkedIn</a> · <a href="https://github.com/tiulpin">GitHub</a>
            </p>
          </div>
        </section>

        <section class="landing-graph-section">
          <div class="graph-label">KNOWLEDGE GRAPH</div>
          <div class="landing-graph-wrapper">
            <div class="graph-container" data-cfg={JSON.stringify({
              drag: true,
              zoom: true,
              depth: -1,
              scale: 0.9,
              repelForce: 0.5,
              centerForce: 0.3,
              linkDistance: 30,
              fontSize: 0.6,
              opacityScale: 1,
              showTags: true,
              removeTags: [],
              focusOnHover: true,
              enableRadial: true,
              excludePatterns: ["de/", "es/", "fr/", "nl/", "ja/", "zh/", "ro/", "uk/", "pt/"],
            })}>
            </div>
          </div>
        </section>

        <section class="landing-grid">
          <div class="landing-col">
            <h2>Recently Published</h2>
            <ul class="landing-feed" id="landing-notes-feed">
              {notes.map((page, index) => {
                const title = page.frontmatter?.title ?? "Untitled"
                const date = getDate(cfg, page)
                const isHidden = index >= 7
                return (
                  <li class={`landing-feed-item${isHidden ? ' feed-item-hidden' : ''}`} data-index={index}>
                    <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                      <span class="feed-title">{title}</span>
                      {date && (
                        <span class="feed-date">
                          <Date date={date} locale={cfg.locale} />
                        </span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
            {notes.length > 7 && (
              <button
                class="landing-show-more"
                type="button"
                onclick="window.location.href='notes/';"
              >
                SHOW MORE
              </button>
            )}
          </div>

          <div class="landing-col">
            <h2>More</h2>
            <div class="landing-block">
              <a href={resolveRelative(fileData.slug!, "resources/")} class="internal landing-big-link">
                Resources →
              </a>
              <p>Reference materials, guides, and cheatsheets</p>
            </div>
            <div class="landing-block">
              <a href={resolveRelative(fileData.slug!, "resources/courses/")} class="internal landing-big-link">
                Courses →
              </a>
              <p>Lecture materials for courses I made in the past</p>
            </div>
            <div class="landing-block">
              <a href="https://www.linkedin.com/in/tiulpin/details/projects/" class="landing-big-link">
                Projects →
              </a>
              <p>Things I've been working on</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  Landing.afterDOMLoaded = concatenateResources(graphScript, textRotatorScript)

  Landing.css = graphStyle + `
body:has(.landing) .sidebar.left,
body:has(.landing) .sidebar.right {
  opacity: 0;
  transition: opacity 0.2s ease;
}

body:has(.landing) .sidebar.left:hover,
body:has(.landing) .sidebar.right:hover {
  opacity: 1;
}

body:has(.landing) footer {
  display: none;
}

body:has(.landing) hr {
  display: none;
}

.landing {
  max-width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 0;
}

.landing-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.title-deck {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  isolation: isolate;
}

.deck-back,
.deck-front {
  border: 5px solid var(--dark);
  padding: 1rem 1.5rem;
  background: var(--secondary);
  box-sizing: border-box;
}

:root[saved-theme="dark"] .deck-back,
:root[saved-theme="dark"] .deck-front {
  border-color: var(--dark);
  background: var(--light);
}

.deck-back {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.deck-front {
  position: relative;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.2s;
}

.title-deck.slide .deck-front {
  transform: translate(10px, 10px);
  z-index: -1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0s;
}

.anki-fact {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--dark);
  text-align: center;
  line-height: 1.4;
  padding: 0.5rem;
}

.title-deck h1 {
  font-family: var(--headerFont);
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 0.85;
  text-transform: uppercase;
  color: var(--dark);
}

.landing-meta {
  flex: 1;
  min-width: 300px;
}

.landing-meta p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--dark);
  margin: 0;
  font-weight: 500;
}

#rotating-text {
  transition: opacity 0.4s ease;
}

#rotating-text.slide-out {
  opacity: 0;
}

#rotating-text.slide-in {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

:root[saved-theme="dark"] .landing-meta p {
  color: var(--dark);
}

.landing-meta a {
  color: var(--dark);
  text-decoration: none;
  font-weight: 700;
  border-bottom: 2px solid var(--dark);
  transition: all 0.1s;
}

.landing-meta a:hover {
  background: var(--secondary);
  border-bottom-width: 3px;
  color: var(--dark);
}

.landing-graph-section {
  margin: 0 0 1.5rem 0;
  position: relative;
  background: transparent;
  border: 0;
  padding: 0;
}

.graph-label {
  position: static;
  display: inline-block;
  margin: 0 0 0.75rem 0;
  font-family: var(--bodyFont);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gray);
  background: transparent;
  padding: 0;
  border: 0;
}

:root[saved-theme="dark"] .graph-label {
  color: var(--gray);
}

.landing-graph-wrapper {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  background: transparent;
}

.landing-graph-section .graph-container {
  width: 100% !important;
  height: 100% !important;
  position: relative !important;
  border: none !important;
  border-radius: 0 !important;
}

.landing-graph-section .graph-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.landing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.landing-col h2 {
  font-family: var(--headerFont);
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 1rem 0;
  color: var(--dark);
  letter-spacing: -0.01em;
}

:root[saved-theme="dark"] .landing-col h2 {
  color: var(--dark);
}

.landing-feed {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.landing-feed-item {
  border: 3px solid var(--dark);
  margin-bottom: -3px;
  background: var(--light);
  transition: all 0.1s ease;
}

.landing-feed-item.feed-item-hidden {
  display: none;
}

:root[saved-theme="dark"] .landing-feed-item {
  border-color: var(--dark);
  background: var(--light);
}

.landing-feed-item:hover {
  transform: translate(-3px, -3px);
  box-shadow: 3px 3px 0 var(--dark);
  z-index: 10;
}

.landing-show-more {
  width: 100%;
  padding: 0.75rem;
  background: var(--light);
  border: 3px solid var(--dark);
  color: var(--dark);
  font-family: var(--headerFont);
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.1s ease;
}

:root[saved-theme="dark"] .landing-show-more {
  background: var(--light);
  border-color: var(--dark);
  color: var(--dark);
}

.landing-show-more:hover {
  background: var(--secondary);
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--dark);
  color: var(--dark);
}

.landing-feed-item a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  text-decoration: none;
  background: none !important;
}

.landing-feed-item a:hover {
  background: none !important;
}

.feed-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.3;
}

:root[saved-theme="dark"] .feed-title {
  color: var(--dark);
}

.feed-date {
  font-size: 0.75rem;
  color: var(--gray);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 700;
  font-family: monospace;
  text-transform: uppercase;
}

.landing-block {
  margin-bottom: 1.25rem;
}

.landing-big-link {
  font-family: var(--headerFont);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--dark);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 0.25rem;
  border-bottom: 3px solid var(--dark);
  transition: all 0.1s;
}

.landing-big-link:hover {
  transform: translateX(5px);
  border-bottom-width: 5px;
}

.landing-block p {
  margin: 0;
  color: var(--darkgray);
  line-height: 1.4;
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .landing-grid {
    grid-template-columns: 1fr;
  }

  .landing-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-deck {
    width: auto;
  }

  .landing-meta {
    min-width: auto;
  }

}

@media (max-width: 600px) {
  .deck-front,
  .deck-back {
    border-width: 4px;
  }

  .deck-back {
    top: -4px;
    left: -4px;
  }

  .title-deck.slide .deck-front {
    transform: translate(8px, 8px);
  }

  .title-deck h1 {
    font-size: 2rem;
  }

  .landing-graph-section {
    margin: 0 0 3rem 0;
  }

  .landing-graph-wrapper {
    height: 400px;
    min-height: 400px;
  }

  .graph-label {
    font-size: 0.65rem;
  }

  .landing-feed-item a {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .landing-feed-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0 var(--dark);
  }

  :root[saved-theme="dark"] .landing-feed-item:hover {
    box-shadow: 2px 2px 0 var(--lightgray);
  }

  .landing-col h2 {
    font-size: 1.5rem;
  }

  .landing-big-link {
    font-size: 1.25rem;
  }
}
`

  return Landing
}) satisfies QuartzComponentConstructor
