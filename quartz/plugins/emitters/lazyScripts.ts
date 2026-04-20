import { FullSlug, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

// The inline-script-loader (see cli/handlers.js) bundles .inline.ts files with
// esbuild (bundle + minify) and exposes them as text strings. We import the
// resulting bundle here and emit it as a standalone static asset so that the
// heavy graph code (pixi.js + d3, ~400KB min) can be code-split away from the
// eagerly-loaded postscript.js and lazy-loaded by graphLazy.inline.ts.
// @ts-ignore
import graphScript from "../../components/scripts/graph.inline"

export const LazyScripts: QuartzEmitterPlugin = () => {
  return {
    name: "LazyScripts",
    async *emit(ctx) {
      yield write({
        ctx,
        slug: joinSegments("static", "graph") as FullSlug,
        ext: ".js",
        content: graphScript as string,
      })
    },
  }
}
