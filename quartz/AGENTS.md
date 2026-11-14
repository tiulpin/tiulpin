# Quartz site (tiulp.in)

This is Viktor Tiulpin's digital garden. It is built with Quartz v4 on Node 22+, TypeScript (strict), esbuild, Preact (not React) and SCSS. Run commands from the repo root (`~`).

- `npm run dev` (or `just dev`) starts the dev server on localhost:8080 with hot reload over WebSocket on port 3001.
- `npm run build` writes the site to `public/` (gitignored).
- Run `npm run check` (TypeScript + Prettier) and `npm run test` before committing. `npm run format` fixes formatting.
- Site config is in `quartz.config.ts` and component placement in `quartz.layout.ts`. CI is in `.github/workflows/ci.yaml`.
- Files named `*.inline.ts` are bundled for the browser. Worker threads start when there are more than 128 content files.

## Code style

- Use descriptive names. Add a comment only for a decision or behavior that the code does not explain.
- Use JSDoc only for information the types cannot express.

## Landing page z-index

`components/Landing.tsx`: `.landing` uses `z-index: 0` so everything on the landing page stays below search (999) and the graph view (9999). For local stacking effects such as card flips, use `isolation: isolate`. Do not put high z-index values on landing elements.
