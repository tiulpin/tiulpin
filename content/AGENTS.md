# Content

Frontmatter: `title`, `date`, `draft`, `tags`, `description`. Use Obsidian wikilinks (`[[path/to/note|Text]]`). GFM, LaTeX, Mermaid and callouts are supported.

Edit hand-written content in `notes/` and `resources/` only when I ask.

## Writing

Write in plain, specific language and lead with the answer or instruction. Keep commands, requirements and useful limitations. Cut preambles, narration of the process, repeated summaries and filler. Use sentence-case headings, consistent terms and ordinary punctuation, and keep the author's voice. Avoid promotional claims, invented labels, forced metaphors, "not X, but Y" contrasts and fragments used for emphasis. Use [tropes.fyi](https://tropes.fyi) as a reference and judge each case in context.

## Translations

Translations go in `i18n/<lang>/` for de, es, fr, ja, nl, pt, ro, uk and zh.

1. `just translate-check` lists missing translations.
2. `just translate` drafts them with DeepL. It needs `DEEPL_API_KEY` in `.env`.
3. Review each draft for consistent formality (tu/vous, du/Sie, tú/usted), translated headers, intact markdown, natural phrasing, and wikilinks that carry the language prefix (`[[es/notes/foo|text]]`).
