# CLAUDE.md

This is Viktor Tiulpin's personal digital garden/notes website built with **Quartz v4** static site generator.

## Quick Reference

### Commands
```bash
npm run dev       # Dev server with hot reload (localhost:8080)
npm run build     # Production build to public/
npm run check     # TypeScript + Prettier validation
npm run format    # Auto-format code
npm run test      # Run unit tests
just dev          # Alias for npm run dev
just build        # Alias for npm run build
just translate-check  # Show missing translations
just translate        # Run DeepL translation for missing content
```

### Tech Stack
- **Runtime:** Node.js 22+, TypeScript
- **Build:** esbuild
- **UI:** Preact (JSX), SCSS
- **Content:** Markdown → remark/rehype → HTML
- **Features:** flexsearch (search), D3.js (graph), Shiki (syntax highlighting)

## Project Structure

```
content/           # Markdown content (notes, resources, recipes)
quartz/            # Framework core
  ├── components/  # Preact UI components (*.tsx)
  ├── plugins/     # transformers/, filters/, emitters/
  ├── processors/  # parse.ts, filter.ts, emit.ts
  ├── i18n/        # Internationalization
  └── util/        # Helpers
docs/              # Framework documentation
public/            # Generated output (gitignored)
quartz.config.ts   # Site configuration
quartz.layout.ts   # Component layout
```

## Configuration

- **Site config:** `quartz.config.ts` - title, URL, analytics, plugins, theme
- **Layout:** `quartz.layout.ts` - component placement (left/right sidebars, etc.)

## Content Authoring

Frontmatter format:
```yaml
---
title: Page Title
date: 2025-01-08
draft: false
tags: [tag1, tag2]
description: Brief description
---
```

Supported features:
- GitHub Flavored Markdown (tables, tasklists)
- Obsidian wikilinks: `[[path/to/note]]` or `[[path|Display Text]]`
- LaTeX math, Mermaid diagrams, callouts
- Syntax highlighting with language tags

## Plugin Architecture

Three plugin types in `quartz/plugins/`:
1. **Transformers** - Process content (frontmatter, syntax, links)
2. **Filters** - Exclude content (drafts, explicit publish)
3. **Emitters** - Generate output (pages, RSS, sitemap, assets)

## Development Notes

- Components are **Preact**, not React
- Worker threads used when >128 content files
- Hot reload via WebSocket on port 3001
- TypeScript strict mode enforced
- `*.inline.ts` files bundle to browser

## Code Style

- **No redundant comments** - avoid obvious comments that restate what the code does. Let the code speak for itself. Good variable/function names > comments.
- **No JSDoc noise** - skip `/** @param */` style comments unless the type system can't express it.
- **Keep it terse** - one blank line between logical sections is enough, no need for comment separators.

## Landing Page CSS

The landing page (`quartz/components/Landing.tsx`) has specific z-index constraints to work with fixed overlays:

- `.landing` uses `z-index: 0` to contain all children in a base-level stacking context
- This ensures landing content stays below search (z-index: 999) and graph view (z-index: 9999)
- Use `isolation: isolate` for local stacking effects (like card flips) without competing with global overlays
- Avoid setting high z-index values on landing elements; they will break search/graph visibility

## Translation Workflow

Content is translated to 9 languages (de, es, fr, ja, nl, pt, ro, uk, zh) stored in `content/i18n/<lang>/`.

**Process:**
1. `just translate-check` - identify missing translations
2. `just translate` - run DeepL API to generate initial translations (requires `DEEPL_API_KEY` in `.env`)
3. Review with LLM - check for:
   - Consistent formality (tu/vous, du/Sie, tú/usted)
   - Proper header translations (not left in English)
   - Correct markdown formatting (links, emphasis)
   - Natural phrasing in target language
   - Wikilinks use local language prefix: `[[es/notes/foo|text]]` not `[[notes/foo|text]]`
4. Fix issues manually or with LLM assistance

The translation script (`scripts/translate.ts`) preserves code blocks, links, math, and other markdown syntax during translation.

## Useful Paths

- Content: `content/notes/`, `content/resources/`
- Translations: `content/i18n/<lang>/`
- Components: `quartz/components/`
- Styles: `quartz/components/styles/`
- CI: `.github/workflows/ci.yaml`
- Wiki: `content/wiki/`

## LLM Wiki

A persistent, LLM-maintained knowledge base that indexes ALL content in `content/`. Existing notes, courses, recipes, and docs are cataloged in the wiki index. New LLM-generated synthesis goes in `content/wiki/pages/`. Everything is published by Quartz, visible in Obsidian's graph view, and searchable.

### Directory Structure

```
content/
  ├── notes/         # Hand-written notes and articles
  ├── resources/     # Courses, recipes, docs, education
  ├── wiki/
  │   ├── raw/       # Immutable source documents (excluded from Quartz via ignorePatterns)
  │   │   └── assets/
  │   ├── pages/     # LLM-generated pages (summaries, entities, concepts, analyses)
  │   ├── index.md   # Master catalog — ALL content with links and one-line summaries
  │   └── log.md     # Chronological record of operations
  └── ...
```

### Page Format

LLM-generated wiki pages in `content/wiki/pages/` use this frontmatter:

```yaml
---
title: Page Title
date: 2026-04-06
tags: [topic1, topic2]
type: source | entity | concept | analysis | comparison
sources: [raw/filename.md]
---
```

- Use Obsidian wikilinks: `[[wiki/pages/page-name]]`, `[[notes/some-note]]`
- Keep pages focused — one entity/concept/source per page

### Workflows

**Ingest** (user drops a source into `content/wiki/raw/` or adds content to `content/`):
1. Read the source/content
2. Discuss key takeaways with the user
3. If raw source: create a summary page in `content/wiki/pages/`
4. Create or update entity/concept pages touched by the source
5. Update `content/wiki/index.md` — this is the master catalog of ALL content
6. Append to `content/wiki/log.md`: `## [YYYY-MM-DD] ingest | Source Title`

**Query** (user asks a question against the wiki):
1. Read `content/wiki/index.md` to find relevant pages across all of `content/`
2. Read those pages and synthesize an answer
3. If the answer is substantial, offer to file it as a new page in `content/wiki/pages/`
4. Log the query: `## [YYYY-MM-DD] query | Question summary`

**Lint** (periodic health check):
1. Check for contradictions between pages
2. Find orphan pages (no inbound links)
3. Identify concepts mentioned but lacking their own page
4. Ensure `content/wiki/index.md` is up to date with all content
5. Suggest new questions to investigate or sources to find
6. Log the lint: `## [YYYY-MM-DD] lint | Summary of findings`

### Conventions

- Raw sources are immutable — never modify files in `content/wiki/raw/`
- The LLM owns `content/wiki/pages/`, `content/wiki/index.md`, and `content/wiki/log.md`
- The LLM does NOT modify hand-written content in `notes/`, `resources/` without explicit request
- `content/wiki/index.md` indexes content that benefits from cross-referencing and synthesis
- **Excluded from wiki:** recipes (`resources/recipes/`) and courses (`resources/courses/`) — recipes don't compound, courses are archived reference material for past students
- Log entries use the format `## [YYYY-MM-DD] operation | Title` for parsability
- When a query produces a valuable analysis, file it in `content/wiki/pages/`
- Raw sources excluded from Quartz build (`wiki/raw` in `ignorePatterns`)
- To keep a wiki page as draft, add `draft: true` to its frontmatter
