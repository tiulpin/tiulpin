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

## Useful Paths

- Content: `content/notes/`, `content/resources/`
- Components: `quartz/components/`
- Styles: `quartz/components/styles/`
- CI: `.github/workflows/ci.yaml`
