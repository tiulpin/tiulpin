import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  email: string
}

const defaultOptions: Options = {
  email: "v@tiulp.in",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const ReplyByEmail: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    const title = fileData.frontmatter?.title ?? "Untitled"
    const baseUrl = cfg.baseUrl ?? "log.tiulp.in"
    const subject = encodeURIComponent(`${baseUrl} — ${title}`)
    const mailtoLink = `mailto:${opts.email}?subject=${subject}`

    return (
      <div class="reply-block">
        <div class="copy">
          <strong>Reply by email.</strong>
          <span class="sub">no comments, no accounts — just write to {opts.email}</span>
        </div>
        <a href={mailtoLink} class="reply-button">Reply →</a>
      </div>
    )
  }

  ReplyByEmail.css = `
.reply-block {
  margin: 2rem 0 0;
  padding: 1rem 1.1rem;
  background: var(--bg-island);
  border: 1px solid var(--border-faint);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.reply-block .copy {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--ink);
  flex: 1;
  min-width: 240px;
}
.reply-block .copy strong { color: var(--ink-strong); font-weight: 600; }
.reply-block .copy .sub {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 0.25rem;
}
.reply-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 28px;
  padding: 0 0.8rem;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink) !important;
  background: transparent;
  border: 1px solid var(--border-island);
  border-radius: 4px;
  text-decoration: none !important;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}
.reply-button:hover {
  background: var(--hover);
  border-color: var(--ink-faint);
  color: var(--ink-strong) !important;
}
`

  return ReplyByEmail
}) satisfies QuartzComponentConstructor
