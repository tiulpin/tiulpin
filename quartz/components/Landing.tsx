import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
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
  limit: 7,
  filter: (f) => f.slug?.startsWith("notes/") ?? false,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Landing: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
    const publishedNotes = allFiles
      .filter(opts.filter)
      .filter((f) => !f.slug?.endsWith("/index"))
      .sort(byDateAndAlphabetical(cfg))

    const notes = publishedNotes.slice(0, opts.limit)

    // stats
    const tagCounts = new Map<string, number>()
    let oldestYear: number | undefined
    for (const f of allFiles.filter(opts.filter)) {
      const tags = (f.frontmatter?.tags ?? []) as string[]
      for (const t of tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      const d = getDate(cfg, f)
      if (d) {
        const y = d.getFullYear()
        if (!oldestYear || y < oldestYear) oldestYear = y
      }
    }

    const topTags = Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return (
      <div class="landing">
        <section class="landing-hero">
          <div class="hero-copy">
            <div class="tag-line">~/log.tiulp.in <span class="blink">▍</span></div>
            <h1>Viktor's notes.</h1>
            <p class="lede" id="rotating-text">
              <strong>A living knowledge base: engineering notes, course archives, crossposts, and experiments.</strong> This is my third brain — a public wiki where I keep knowledge in one place.
            </p>
          </div>
          <div class="hero-stats">
            <div><span class="n">{publishedNotes.length}</span>notes</div>
            <div><span class="n">{tagCounts.size}</span>tags</div>
            {oldestYear && <div><span class="n">{oldestYear}</span>since</div>}
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
          <div class="feed-col">
            <h2>Recently published</h2>
            <div class="feed-list">
              {notes.map((page) => {
                const title = page.frontmatter?.title ?? "Untitled"
                const date = getDate(cfg, page)
                const desc = (page.description ?? "").trim()
                return (
                  <a
                    class="feed-item"
                    href={resolveRelative(fileData.slug!, page.slug!)}
                  >
                    {date && (
                      <span class="date">
                        <Date date={date} locale={cfg.locale} />
                      </span>
                    )}
                    <div class="body">
                      <span class="title">{title}</span>
                      {desc && <p class="excerpt">{desc}</p>}
                    </div>
                  </a>
                )
              })}
            </div>
            <div class="feed-actions">
              <a class="btn-ghost" href={resolveRelative(fileData.slug!, "notes/" as FullSlug)}>
                All notes <span class="arrow">→</span>
              </a>
            </div>
          </div>

          <aside class="side-col">
            <div class="side-block">
              <h2>Explore</h2>
              <div class="card-stack">
                <a class="card-link" href={resolveRelative(fileData.slug!, "resources/" as FullSlug)}>
                  <span class="label">→ resources</span>
                  <span class="title">Reference materials</span>
                  <span class="desc">Cheatsheets, guides, and the long-form references I keep coming back to.</span>
                </a>
                <a class="card-link" href={resolveRelative(fileData.slug!, "resources/courses/" as FullSlug)}>
                  <span class="label">→ courses</span>
                  <span class="title">Course archives</span>
                  <span class="desc">Lecture notes from courses I've taught, kept in case anyone needs them.</span>
                </a>
                <a class="card-link" href="https://www.linkedin.com/in/tiulpin/details/projects/">
                  <span class="label">→ projects</span>
                  <span class="title">Things I've shipped</span>
                  <span class="desc">Side projects, plugins, experiments. Some still alive, some honest fossils.</span>
                </a>
              </div>
            </div>

            {topTags.length > 0 && (
              <div class="side-block">
                <h2>Tags</h2>
                <div class="tagcloud">
                  {topTags.map(([tag, count]) => (
                    <a href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}>
                      #{tag}<span class="n">{count}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div class="side-block">
              <h2>Elsewhere</h2>
              <ul class="elsewhere">
                <li><a href="https://tiulp.in/">↗ tiulp.in <span class="note">— main site</span></a></li>
                <li><a href="https://feed.tiulp.in/">↗ feed.tiulp.in <span class="note">— microblog</span></a></li>
                <li><a href="https://github.com/tiulpin">↗ github.com/tiulpin</a></li>
                <li><a href="https://www.linkedin.com/in/tiulpin">↗ linkedin.com/in/tiulpin</a></li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    )
  }

  Landing.afterDOMLoaded = concatenateResources(graphScript, textRotatorScript)

  Landing.css = graphStyle + `
.landing {
  max-width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 0;
}


/* ============================================================
 * Hero
 * ============================================================ */
.landing-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--rule);
  margin: 0.5rem 0 2rem;
}

.landing-hero .tag-line {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
}

.landing-hero .tag-line .blink {
  color: var(--accent);
  animation: landing-blink 1s steps(2) infinite;
}

@keyframes landing-blink { 50% { opacity: 0; } }

.landing-hero h1 {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin: 0;
}

.landing-hero .lede {
  font-family: var(--font-body);
  font-size: 1.2rem;
  line-height: 1.45;
  color: var(--ink);
  margin: 1rem 0 0;
  max-width: 36em;
  text-wrap: pretty;
  transition: opacity 0.4s ease;
  font-weight: 400;
}

.landing-hero .lede strong {
  color: var(--ink-strong);
  font-weight: 600;
}

.landing-hero .lede.slide-out { opacity: 0; }
.landing-hero .lede.slide-in {
  opacity: 0;
  animation: lede-fade-in 0.4s ease forwards;
}
@keyframes lede-fade-in { to { opacity: 1; } }

.hero-stats {
  display: flex;
  gap: 1.5rem;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
  text-transform: lowercase;
  letter-spacing: 0.02em;
}

.hero-stats .n {
  display: block;
  font-family: var(--font-body);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--ink-strong);
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

/* ============================================================
 * Graph section
 * ============================================================ */
.landing-graph-section {
  margin: 0 0 2.5rem 0;
  position: relative;
  background: transparent;
  border: 0;
  padding: 0;
}

.graph-label {
  display: inline-block;
  margin: 0 0 0.75rem 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--ink-faint);
}

.landing-graph-wrapper {
  position: relative;
  width: 100%;
  height: 340px;
  overflow: hidden;
  background: transparent;
  border: 1px solid var(--border-faint);
  border-radius: var(--radius);
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

/* ============================================================
 * Grid: feed + side column
 * ============================================================ */
.landing-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 3rem;
}

@media (max-width: 880px) {
  .landing-grid { grid-template-columns: 1fr; gap: 2rem; }
  .landing-hero { grid-template-columns: 1fr; align-items: start; }
  .landing-hero h1 { font-size: 2.5rem; }
  .hero-stats { gap: 1.25rem; }
}

/* section headings (shared) */
.feed-col > h2,
.side-block > h2 {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.feed-col > h2::after,
.side-block > h2::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule);
}

/* ============================================================
 * Feed list
 * ============================================================ */
.feed-list { display: flex; flex-direction: column; }

.feed-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--rule);
  align-items: baseline;
  text-decoration: none !important;
  background: transparent !important;
  color: inherit;
}

.feed-item .date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.feed-item .body { min-width: 0; }

.feed-item .title {
  display: block;
  font-family: var(--font-body);
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink-strong);
  text-wrap: balance;
  letter-spacing: -0.005em;
  transition: color 150ms ease;
}

.feed-item:hover .title { color: var(--accent); }

.feed-item .excerpt {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--ink-mute);
  line-height: 1.5;
  margin: 0.35rem 0 0 0;
  text-wrap: pretty;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-actions { margin-top: 1.25rem; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 6px 12px;
  border: 1px solid var(--border-island);
  border-radius: 4px;
  color: var(--ink);
  text-decoration: none;
  background: transparent;
  transition: border-color 120ms ease, background 120ms ease;
}
.btn-ghost:hover {
  background: var(--hover);
  border-color: var(--ink-faint);
  color: var(--ink-strong);
}
.btn-ghost .arrow { font-family: var(--font-mono); }

/* ============================================================
 * Side column
 * ============================================================ */
.side-col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.card-stack { display: flex; flex-direction: column; gap: 0.6rem; }

.card-link {
  display: block;
  padding: 0.9rem 1rem;
  background: var(--bg-island);
  border: 1px solid var(--border-faint);
  border-radius: var(--radius);
  text-decoration: none !important;
  transition: border-color 150ms ease, transform 150ms ease;
  color: inherit;

  background-color: var(--bg-island) !important;
}

.card-link:hover {
  border-color: var(--ink-faint);
  transform: translateY(-1px);
}

.card-link .label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.card-link .title {
  display: block;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink-strong);
  margin-top: 0.25rem;
}

.card-link .desc {
  display: block;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--ink-mute);
  line-height: 1.45;
  margin-top: 0.2rem;
}

/* tag cloud */
.tagcloud { display: flex; flex-wrap: wrap; gap: 5px; }

.tagcloud a {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 8px;
  border: 1px solid var(--border-faint);
  background: var(--bg-island) !important;
  color: var(--ink-mute);
  border-radius: 4px;
  text-decoration: none !important;
  transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
  font-weight: 500;
}
.tagcloud a:hover {
  border-color: var(--accent);
  color: var(--ink-strong);
  background: var(--accent-soft) !important;
}
.tagcloud a .n {
  color: var(--ink-faint);
  margin-left: 4px;
  font-size: 10px;
}

/* elsewhere links */
ul.elsewhere {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0.4rem;
  font-family: var(--font-mono); font-size: 12px;
}
ul.elsewhere a {
  color: var(--ink);
  text-decoration: none !important;
  background: transparent !important;
  font-weight: 400;
}
ul.elsewhere a:hover { color: var(--accent); }
ul.elsewhere .note { color: var(--ink-faint); }

@media (max-width: 600px) {
  .feed-item { grid-template-columns: 1fr; gap: 0.3rem; }
  .feed-item .date { order: 2; font-size: 10px; }
  .feed-item .body { order: 1; }
  .landing-graph-wrapper { height: 280px; }
}
`

  return Landing
}) satisfies QuartzComponentConstructor
