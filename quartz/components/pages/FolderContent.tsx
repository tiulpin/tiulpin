import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

import style from "../styles/listPage.scss"
import { PageList, SortFn, byDateAndAlphabetical } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
import { FullSlug, resolveRelative } from "../../util/path"
import { Date as DateComponent, getDate } from "../Date"
import readingTime from "reading-time"
// @ts-ignore
import filterScript from "../scripts/folderFilter.inline"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }
                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }
                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new globalThis.Date(),
                  modified: new globalThis.Date(),
                  published: new globalThis.Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    // Sort by date desc
    const sorted = [...allPagesInFolder].sort(byDateAndAlphabetical(cfg))

    // Group by year
    const byYear = new Map<number, QuartzPluginData[]>()
    let oldestYear: number | undefined
    let newestDate: globalThis.Date | undefined
    const tagCounts = new Map<string, number>()

    for (const page of sorted) {
      const d = getDate(cfg, page)
      const year = d ? d.getFullYear() : 0
      if (!byYear.has(year)) byYear.set(year, [])
      byYear.get(year)!.push(page)
      if (d) {
        if (!oldestYear || year < oldestYear) oldestYear = year
        if (!newestDate || d > newestDate) newestDate = d
      }
      for (const t of (page.frontmatter?.tags ?? []) as string[]) {
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      }
    }

    const topTags = Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([t]) => t)

    const years = Array.from(byYear.keys()).sort((a, b) => b - a)

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>

        <div class="folder-archive">
          <div class="archive-meta">
            {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({ count: allPagesInFolder.length })}
            {oldestYear && <> · oldest first published {oldestYear}</>}
            {newestDate && (
              <> · last updated <DateComponent date={newestDate} locale={cfg.locale} /></>
            )}
          </div>

          {topTags.length > 0 && (
            <div class="archive-toolbar" role="group" aria-label="Filter by tag">
              <button type="button" class="filter-pill active" data-filter="all">all</button>
              {topTags.map((t) => (
                <button type="button" class="filter-pill" data-filter={t}>#{t}</button>
              ))}
            </div>
          )}

          {years.map((year) => {
            const items = byYear.get(year)!
            return (
              <section class="year-group" data-year={year}>
                <div class="year-head">
                  <span class="year">{year || "—"}</span>
                  <span class="count">
                    <span class="year-count-visible">{items.length}</span>{" "}
                    {items.length === 1 ? "note" : "notes"}
                  </span>
                  <span class="rule" />
                </div>
                <div class="year-list">
                  {items.map((page) => {
                    const title = page.frontmatter?.title ?? "Untitled"
                    const d = getDate(cfg, page)
                    const tags = (page.frontmatter?.tags ?? []) as string[]
                    const rt = page.text ? readingTime(page.text) : null
                    const mins = rt ? Math.max(1, Math.ceil(rt.minutes)) : undefined
                    return (
                      <a
                        class="note-row"
                        href={resolveRelative(fileData.slug!, page.slug!)}
                        data-tags={tags.join(",")}
                      >
                        <span class="date">
                          {d && <DateComponent date={d} locale={cfg.locale} />}
                        </span>
                        <span class="title">{title}</span>
                        <span class="tags">
                          {tags.slice(0, 3).map((t) => (
                            <span>#{t}</span>
                          ))}
                        </span>
                        <span class="read">{mins ? `${mins} min` : ""}</span>
                      </a>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css)
  FolderContent.afterDOMLoaded = filterScript
  return FolderContent
}) satisfies QuartzComponentConstructor
