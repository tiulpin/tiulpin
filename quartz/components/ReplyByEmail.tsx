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
      <div class="reply-by-email">
        <a href={mailtoLink} class="reply-by-email-button">
          Reply by Email
        </a>
      </div>
    )
  }

  ReplyByEmail.css = `
.reply-by-email {
  margin-top: 1.5rem;
}

.reply-by-email-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--light);
  border: 3px solid var(--dark);
  color: var(--dark);
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.1s ease;
  text-decoration: none;
}

:root[saved-theme="dark"] .reply-by-email-button {
  background: var(--light);
  border-color: var(--dark);
  color: var(--dark);
}

.reply-by-email-button:hover {
  background: var(--lightgray);
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--dark);
  color: var(--dark);
}
`

  return ReplyByEmail
}) satisfies QuartzComponentConstructor
