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
    baseUrl: "v.tiulp.in",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        title: { name: "Instrument Serif", weights: [400] },
        header: "Instrument Serif",
        body: "JetBrains Mono",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "hsl(30, 25%, 96%)",
          lightgray: "hsl(30, 20%, 90%)",
          gray: "hsl(0, 3%, 45%)",
          darkgray: "hsl(0, 5%, 25%)",
          dark: "hsl(0, 8%, 10%)",
          secondary: "hsl(0, 65%, 45%)",
          tertiary: "hsl(0, 70%, 38%)",
          highlight: "hsla(30, 20%, 50%, 0.1)",
          textHighlight: "hsla(45, 80%, 60%, 0.35)",
        },
        darkMode: {
          light: "hsl(0, 0%, 7%)",
          lightgray: "hsl(0, 0%, 15%)",
          gray: "hsl(0, 0%, 45%)",
          darkgray: "hsl(0, 0%, 75%)",
          dark: "hsl(0, 0%, 90%)",
          secondary: "hsl(0, 53%, 58%)",
          tertiary: "hsl(0, 60%, 50%)",
          highlight: "hsla(0, 0%, 50%, 0.12)",
          textHighlight: "hsla(45, 60%, 50%, 0.3)",
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
    ],
  },
}

export default config
