import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Viktor's notes",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "log.tiulp.in",
    ignorePatterns: ["private", "templates", ".obsidian", "wiki/raw"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        title: { name: "Source Serif 4", weights: [600, 700] },
        header: { name: "Source Serif 4", weights: [400, 600, 700] },
        body: { name: "Source Serif 4", weights: [400, 600], includeItalic: true },
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "hsl(40, 20%, 97%)",
          lightgray: "hsl(35, 15%, 91%)",
          gray: "hsl(0, 2%, 50%)",
          darkgray: "hsl(0, 3%, 28%)",
          dark: "hsl(0, 5%, 18%)",
          secondary: "hsl(0, 55%, 42%)",
          tertiary: "hsl(0, 60%, 36%)",
          highlight: "hsla(35, 15%, 50%, 0.08)",
          textHighlight: "hsla(45, 80%, 60%, 0.3)",
        },
        darkMode: {
          light: "hsl(0, 0%, 9%)",
          lightgray: "hsl(0, 0%, 16%)",
          gray: "hsl(0, 0%, 50%)",
          darkgray: "hsl(0, 0%, 78%)",
          dark: "hsl(0, 0%, 88%)",
          secondary: "hsl(0, 48%, 60%)",
          tertiary: "hsl(0, 55%, 52%)",
          highlight: "hsla(0, 0%, 50%, 0.1)",
          textHighlight: "hsla(45, 60%, 50%, 0.25)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.MultilingualContent({
        defaultLocale: "en-US",
        i18nDir: "i18n",
        locales: {
          en: { name: "English", locale: "en-US" },
          es: { name: "Español", locale: "es-ES" },
          pt: { name: "Português", locale: "pt-BR" },
          fr: { name: "Français", locale: "fr-FR" },
          de: { name: "Deutsch", locale: "de-DE" },
          nl: { name: "Nederlands", locale: "nl-NL" },
          ja: { name: "日本語", locale: "ja-JP" },
          zh: { name: "中文", locale: "zh-CN" },
          ro: { name: "Română", locale: "ro-RO" },
          uk: { name: "Українська", locale: "uk-UA" },
        },
      }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
      Plugin.LazyScripts(),
      Plugin.CacheHeaders(),
    ],
  },
}

export default config
