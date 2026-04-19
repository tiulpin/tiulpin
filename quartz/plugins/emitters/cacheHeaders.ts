import { FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

// Emits a Cloudflare Pages / Netlify `_headers` file that overrides the
// default `Cache-Control: max-age=0, must-revalidate` served today.
//
// The strategy:
//  * HTML is revalidated (content changes with each publish, no content hash)
//  * JSON indexes get a short SWR window (stale-while-revalidate keeps SPA
//    navigation instant while still picking up fresh data on subsequent loads)
//  * The static CSS/JS bundles and fonts are cached for a week — they're
//    small, and the SPA router busts the cache by full reload when content
//    structure changes anyway.
const HEADERS = `/*
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate

/index.css
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/prescript.js
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/postscript.js
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/static/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/static/fonts/*
  Cache-Control: public, max-age=2592000, immutable

/static/contentIndex.json
  Cache-Control: public, max-age=300, stale-while-revalidate=86400

/static/searchIndex.json
  Cache-Control: public, max-age=300, stale-while-revalidate=86400
`

export const CacheHeaders: QuartzEmitterPlugin = () => {
  return {
    name: "CacheHeaders",
    async *emit(ctx) {
      yield write({
        ctx,
        slug: "_headers" as FullSlug,
        ext: "",
        content: HEADERS,
      })
    },
  }
}
