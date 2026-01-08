#!/usr/bin/env npx ts-node
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const CONTENT_DIR = path.join(__dirname, '..', 'content')
const I18N_DIR = path.join(CONTENT_DIR, 'i18n')

const LANGUAGES: Record<string, { name: string; deeplCode: string }> = {
  es: { name: 'Spanish', deeplCode: 'ES' },
  pt: { name: 'Portuguese', deeplCode: 'PT-BR' },
  fr: { name: 'French', deeplCode: 'FR' },
  de: { name: 'German', deeplCode: 'DE' },
  nl: { name: 'Dutch', deeplCode: 'NL' },
  ja: { name: 'Japanese', deeplCode: 'JA' },
  zh: { name: 'Chinese', deeplCode: 'ZH' },
  ro: { name: 'Romanian', deeplCode: 'RO' },
  uk: { name: 'Ukrainian', deeplCode: 'UK' },
}

const SKIP_PATTERNS = ['index.md', 'resources/']

interface Frontmatter {
  title?: string
  date?: string
  tags?: string[]
  description?: string
  translationKey?: string
  [key: string]: unknown
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const yamlStr = match[1]
  const body = match[2]
  const frontmatter: Frontmatter = {}
  const lines = yamlStr.split('\n')
  let currentKey = ''
  let inArray = false
  let arrayValues: string[] = []

  for (const line of lines) {
    if (line.match(/^\s*-\s+/)) {
      const value = line.replace(/^\s*-\s+/, '').trim()
      arrayValues.push(value)
    } else if (line.match(/^(\w+):\s*$/)) {
      if (inArray && currentKey) {
        frontmatter[currentKey] = arrayValues
      }
      currentKey = line.match(/^(\w+):/)?.[1] || ''
      inArray = true
      arrayValues = []
    } else if (line.match(/^(\w+):\s*.+/)) {
      if (inArray && currentKey) {
        frontmatter[currentKey] = arrayValues
      }
      inArray = false
      const keyMatch = line.match(/^(\w+):\s*(.+)/)
      if (keyMatch) {
        let value = keyMatch[2].trim()
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        frontmatter[keyMatch[1]] = value
      }
    }
  }

  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayValues
  }

  return { frontmatter, body }
}

function stringifyFrontmatter(frontmatter: Frontmatter): string {
  const lines: string[] = ['---']

  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`)
      for (const item of value) {
        lines.push(`    - ${item}`)
      }
    } else if (value !== undefined && value !== null) {
      const strValue = String(value)
      if (strValue.includes(':') || strValue.includes('#') || strValue.includes("'")) {
        lines.push(`${key}: "${strValue}"`)
      } else {
        lines.push(`${key}: ${strValue}`)
      }
    }
  }

  lines.push('---')
  return lines.join('\n')
}

function getNotesToTranslate(): string[] {
  const notes: string[] = []
  const notesDir = path.join(CONTENT_DIR, 'notes')

  if (!fs.existsSync(notesDir)) return notes

  const files = fs.readdirSync(notesDir)
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    if (SKIP_PATTERNS.some(p => file.includes(p))) continue

    notes.push(path.join('notes', file))
  }

  return notes
}

function getExistingTranslations(): Map<string, Set<string>> {
  const translations = new Map<string, Set<string>>()

  for (const lang of Object.keys(LANGUAGES)) {
    const langDir = path.join(I18N_DIR, lang, 'notes')
    if (!fs.existsSync(langDir)) continue

    const files = fs.readdirSync(langDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const notePath = path.join('notes', file)
      if (!translations.has(notePath)) {
        translations.set(notePath, new Set())
      }
      translations.get(notePath)!.add(lang)
    }
  }

  return translations
}

function checkMissingTranslations(): void {
  const notes = getNotesToTranslate()
  const existing = getExistingTranslations()
  const languages = Object.keys(LANGUAGES)

  console.log('=== Missing Translations Report ===\n')

  let totalMissing = 0

  for (const note of notes) {
    const existingLangs = existing.get(note) || new Set()
    const missingLangs = languages.filter(l => !existingLangs.has(l))

    if (missingLangs.length > 0) {
      console.log(`${note}:`)
      console.log(`  Missing: ${missingLangs.join(', ')}`)
      console.log(`  Existing: ${existingLangs.size > 0 ? [...existingLangs].join(', ') : 'none'}`)
      console.log()
      totalMissing += missingLangs.length
    }
  }

  console.log(`\nTotal: ${notes.length} notes, ${totalMissing} missing translations`)
  console.log(`Languages: ${languages.join(', ')}`)
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY not set in .env')
  }

  const langConfig = LANGUAGES[targetLang]
  if (!langConfig) {
    throw new Error(`Unknown language: ${targetLang}`)
  }

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: langConfig.deeplCode,
      source_lang: 'EN',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepL API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as { translations: Array<{ text: string }> }
  return data.translations[0].text
}

async function translateFile(notePath: string, targetLang: string): Promise<void> {
  const sourcePath = path.join(CONTENT_DIR, notePath)
  const targetDir = path.join(I18N_DIR, targetLang, path.dirname(notePath))
  const targetPath = path.join(targetDir, path.basename(notePath))

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`)
    return
  }

  fs.mkdirSync(targetDir, { recursive: true })
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(sourceContent)

  console.log(`Translating ${notePath} to ${LANGUAGES[targetLang].name}...`)

  let translatedTitle = frontmatter.title
  if (frontmatter.title) {
    translatedTitle = await translateText(frontmatter.title, targetLang)
    console.log(`  Title: "${frontmatter.title}" -> "${translatedTitle}"`)
  }

  const translatedBody = await translateMarkdownBody(body, targetLang)
  const translatedFrontmatter: Frontmatter = {
    ...frontmatter,
    title: translatedTitle,
    translationKey: notePath.replace(/\.md$/, '').replace(/^notes\//, 'notes/'),
  }

  const translatedContent = stringifyFrontmatter(translatedFrontmatter) + '\n' + translatedBody
  fs.writeFileSync(targetPath, translatedContent)

  console.log(`  Saved: ${targetPath}`)
}

async function translateMarkdownBody(body: string, targetLang: string): Promise<string> {
  const preservePatterns = [
    /```[\s\S]*?```/g,
    /`[^`]+`/g,
    /\$\$[\s\S]*?\$\$/g,
    /\$[^$]+\$/g,
    /!\[.*?\]\(.*?\)/g,
    /\[\[.*?\]\]/g,
    /<[^>]+>/g,
  ]

  const preserved: string[] = []
  let processedBody = body

  for (const pattern of preservePatterns) {
    processedBody = processedBody.replace(pattern, (match) => {
      preserved.push(match)
      return `__PRESERVE_${preserved.length - 1}__`
    })
  }

  processedBody = processedBody.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    preserved.push(url)
    return `[${text}](__PRESERVE_${preserved.length - 1}__)`
  })

  if (processedBody.trim()) {
    processedBody = await translateText(processedBody, targetLang)
  }

  for (let i = 0; i < preserved.length; i++) {
    processedBody = processedBody.replace(`__PRESERVE_${i}__`, preserved[i])
  }

  return processedBody
}

async function translateAll(): Promise<void> {
  const notes = getNotesToTranslate()
  const existing = getExistingTranslations()
  const languages = Object.keys(LANGUAGES)

  console.log('=== Starting Translation ===\n')

  for (const note of notes) {
    const existingLangs = existing.get(note) || new Set()

    for (const lang of languages) {
      if (existingLangs.has(lang)) {
        console.log(`Skipping ${note} -> ${lang} (already exists)`)
        continue
      }

      try {
        await translateFile(note, lang)
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Error translating ${note} to ${lang}:`, error)
      }
    }
  }

  console.log('\n=== Translation Complete ===')
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'check':
      checkMissingTranslations()
      break

    case 'translate':
      if (args[1] && args[2]) {
        // Translate specific file to specific language
        await translateFile(args[1], args[2])
      } else {
        // Translate all missing
        await translateAll()
      }
      break

    default:
      console.log(`
Translation Script

Usage:
  npx ts-node scripts/translate.ts check              # Check missing translations
  npx ts-node scripts/translate.ts translate          # Translate all missing content
  npx ts-node scripts/translate.ts translate <file> <lang>  # Translate specific file

Languages: ${Object.entries(LANGUAGES).map(([k, v]) => `${k} (${v.name})`).join(', ')}
      `)
  }
}

main().catch(console.error)
