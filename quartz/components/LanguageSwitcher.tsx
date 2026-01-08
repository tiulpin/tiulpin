import styles from "./styles/languageswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative, FullSlug } from "../util/path"
import { i18n } from "../i18n"

export interface LanguageSwitcherOptions {
  locales: Record<string, { name: string }>
}

const defaultOptions: LanguageSwitcherOptions = {
  locales: {
    en: { name: "English" },
  },
}

export default ((userOpts?: Partial<LanguageSwitcherOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const LanguageSwitcher: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const multilingual = fileData.multilingual
    if (!multilingual) return null

    const { lang: currentLang, translationKey } = multilingual
    const otherTranslations: Array<{
      lang: string
      name: string
      slug: FullSlug
    }> = []

    for (const [langCode, config] of Object.entries(opts.locales)) {
      if (langCode === currentLang) continue

      const matchingFile = allFiles.find((f) => {
        const fMulti = f.multilingual
        if (!fMulti) return false
        return fMulti.translationKey === translationKey && fMulti.lang === langCode
      })

      if (matchingFile) {
        otherTranslations.push({
          lang: langCode,
          name: config.name,
          slug: matchingFile.slug as FullSlug,
        })
      }
    }

    if (otherTranslations.length === 0) return null
    otherTranslations.sort((a, b) => a.name.localeCompare(b.name))

    return (
      <p class={classNames(displayClass, "translation-notice")}>
        <span>{i18n(cfg.locale).components.languageSwitcher.alsoAvailableIn} </span>
        {otherTranslations.map((t, i) => (
          <>
            <a href={resolveRelative(fileData.slug!, t.slug)}>{t.name}</a>
            {i < otherTranslations.length - 1 ? ", " : ""}
          </>
        ))}
      </p>
    )
  }

  LanguageSwitcher.css = styles

  return LanguageSwitcher
}) satisfies QuartzComponentConstructor<Partial<LanguageSwitcherOptions>>
