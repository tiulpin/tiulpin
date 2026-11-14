# LLM wiki

This is a knowledge base that the LLM maintains and that indexes `content/`. Recipes and courses are left out.

- `raw/` holds immutable sources. Never edit it. It is excluded from the build.
- You own `pages/`, `index.md` (the master catalog with one-line summaries) and `log.md`.
- Page frontmatter: `title`, `date`, `tags`, `type` (source | entity | concept | analysis | comparison), `sources`. Add `draft: true` to hide a page. Keep each page to one topic and link with `[[wiki/pages/name]]`.
- Log entries use the format `## [YYYY-MM-DD] ingest|query|lint | Title`.

Workflows:

- **Ingest:** read the source and discuss takeaways with me. Write a summary page for raw sources, update the related entity and concept pages and `index.md`, then log the ingest.
- **Query:** start from `index.md`, synthesize an answer, offer to file substantial answers as a page, then log the query.
- **Lint:** look for contradictions, orphan pages, concepts that lack a page, and gaps in `index.md`. Suggest new sources, then log the lint.
