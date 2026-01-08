import { QuartzTransformerPlugin } from "../types"
import { FullSlug, simplifySlug } from "../../util/path"
import { ValidLocale } from "../../i18n"

export interface MultilingualOptions {
  defaultLocale: ValidLocale
  i18nDir: string
  locales: Record<string, { name: string; locale: ValidLocale }>
}

const defaultOptions: MultilingualOptions = {
  defaultLocale: "en-US",
  i18nDir: "i18n",
  locales: {
    en: { name: "English", locale: "en-US" },
  },
}

function extractLanguageFromPath(
  slug: FullSlug,
  i18nDir: string,
  supportedLangs: string[],
): string | null {
  const parts = slug.split("/")
  if (parts[0] === i18nDir && parts.length > 1) {
    const langCode = parts[1]
    if (supportedLangs.includes(langCode)) {
      return langCode
    }
  }

  return null
}

function getCanonicalPath(slug: FullSlug, i18nDir: string, langCode: string | null): string {
  if (!langCode) return slug
  const parts = slug.split("/")
  if (parts[0] === i18nDir) {
    return parts.slice(2).join("/")
  }

  return slug
}

export const MultilingualContent: QuartzTransformerPlugin<Partial<MultilingualOptions>> = (
  userOpts,
) => {
  const opts = { ...defaultOptions, ...userOpts }
  const supportedLangs = Object.keys(opts.locales)

  return {
    name: "MultilingualContent",
    markdownPlugins(ctx) {
      return [
        () => {
          return (_, file) => {
            const slug = file.data.slug as FullSlug
            const frontmatter = file.data.frontmatter ?? {}
            let langCode = extractLanguageFromPath(slug, opts.i18nDir, supportedLangs)
            let detectedLocale: ValidLocale = opts.defaultLocale

            if (langCode && opts.locales[langCode]) {
              detectedLocale = opts.locales[langCode].locale
            } else if (frontmatter.lang && typeof frontmatter.lang === "string") {
              const fmLang = frontmatter.lang.toLowerCase()
              for (const [code, config] of Object.entries(opts.locales)) {
                if (code === fmLang || config.locale.toLowerCase().startsWith(fmLang)) {
                  langCode = code
                  detectedLocale = config.locale
                  break
                }
              }
            }

            if (!langCode) {
              langCode = Object.entries(opts.locales).find(
                ([_, config]) => config.locale === opts.defaultLocale,
              )?.[0] ?? "en"
            }

            const canonicalPath = getCanonicalPath(slug, opts.i18nDir, langCode)
            const translationKey = (frontmatter.translationKey as string) ?? canonicalPath
            const isTranslation = slug.startsWith(opts.i18nDir + "/")

            let newSlug = slug
            if (isTranslation) {
              const parts = slug.split("/")
              newSlug = parts.slice(1).join("/") as FullSlug
              file.data.slug = newSlug as FullSlug
            }

            file.data.multilingual = {
              lang: langCode,
              locale: detectedLocale,
              translationKey,
              canonicalPath,
              isTranslation,
            }

            if (file.data.frontmatter) {
              file.data.frontmatter.lang = langCode
            }
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    multilingual: {
      lang: string
      locale: ValidLocale
      translationKey: string
      canonicalPath: string
      isTranslation: boolean
    }
  }
}

export default MultilingualContent
