#!/usr/bin/env tsx
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const SKIP_PATTERNS = ['index.md']
const CONTENT_DIRS = ['notes', 'resources/recipes']

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

function getFilesToTranslate(): string[] {
  const files: string[] = []

  for (const dir of CONTENT_DIRS) {
    const fullDir = path.join(CONTENT_DIR, dir)
    if (!fs.existsSync(fullDir)) continue

    const dirFiles = fs.readdirSync(fullDir)
    for (const file of dirFiles) {
      if (!file.endsWith('.md')) continue
      if (SKIP_PATTERNS.some(p => file.includes(p))) continue
      files.push(path.join(dir, file))
    }
  }

  return files
}

function getExistingTranslations(): Map<string, Set<string>> {
  const translations = new Map<string, Set<string>>()

  for (const lang of Object.keys(LANGUAGES)) {
    for (const dir of CONTENT_DIRS) {
      const langDir = path.join(I18N_DIR, lang, dir)
      if (!fs.existsSync(langDir)) continue

      const files = fs.readdirSync(langDir)
      for (const file of files) {
        if (!file.endsWith('.md')) continue

        const filePath = path.join(dir, file)
        if (!translations.has(filePath)) {
          translations.set(filePath, new Set())
        }
        translations.get(filePath)!.add(lang)
      }
    }
  }

  return translations
}

function checkMissingTranslations(): void {
  const files = getFilesToTranslate()
  const existing = getExistingTranslations()
  const languages = Object.keys(LANGUAGES)

  console.log('=== Missing Translations Report ===\n')

  let totalMissing = 0

  for (const file of files) {
    const existingLangs = existing.get(file) || new Set()
    const missingLangs = languages.filter(l => !existingLangs.has(l))

    if (missingLangs.length > 0) {
      console.log(`${file}:`)
      console.log(`  Missing: ${missingLangs.join(', ')}`)
      console.log(`  Existing: ${existingLangs.size > 0 ? [...existingLangs].join(', ') : 'none'}`)
      console.log()
      totalMissing += missingLangs.length
    }
  }

  console.log(`\nTotal: ${files.length} files, ${totalMissing} missing translations`)
  console.log(`Languages: ${languages.join(', ')}`)
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function translateText(text: string, targetLang: string, retries = 3): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY not set in .env')
  }

  const langConfig = LANGUAGES[targetLang]
  if (!langConfig) {
    throw new Error(`Unknown language: ${targetLang}`)
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
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

    if (response.status === 429) {
      const waitTime = attempt * 5000
      console.log(`    Rate limited, waiting ${waitTime / 1000}s before retry ${attempt}/${retries}...`)
      await sleep(waitTime)
      continue
    }

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepL API error: ${response.status} - ${error}`)
    }

    const data = await response.json() as { translations: Array<{ text: string }> }
    return data.translations[0].text
  }

  throw new Error('Max retries exceeded for DeepL API')
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
    translationKey: notePath.replace(/\.md$/, ''),
  }

  const translatedContent = stringifyFrontmatter(translatedFrontmatter) + '\n' + translatedBody
  fs.writeFileSync(targetPath, translatedContent)

  console.log(`  Saved: ${targetPath}`)
}

async function translateMarkdownBody(body: string, targetLang: string): Promise<string> {
  const preserved: string[] = []

  let processed = body

  // Preserve code blocks
  processed = processed.replace(/```[\s\S]*?```/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve inline code
  processed = processed.replace(/`[^`]+`/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve math blocks
  processed = processed.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })
  processed = processed.replace(/\$[^$\n]+\$/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve wikilinks
  processed = processed.replace(/\[\[[^\]]+\]\]/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve image syntax
  processed = processed.replace(/!\[[^\]]*\]\([^)]+\)/g, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve URLs in markdown links but allow text translation
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    preserved.push(url)
    return `[${text}](<x id="${preserved.length - 1}"/>)`
  })

  // Preserve callout markers
  processed = processed.replace(/^(>\s*\[!(\w+)\])/gm, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Preserve table structure markers (pipe characters and separator rows)
  processed = processed.replace(/^\|[-:\s|]+\|$/gm, (match) => {
    preserved.push(match)
    return `<x id="${preserved.length - 1}"/>`
  })

  // Translate the processed text
  const translated = await translateText(processed, targetLang)

  // Restore preserved content
  let result = translated
  for (let i = 0; i < preserved.length; i++) {
    result = result.replace(new RegExp(`<x id="${i}"\\s*/>`, 'g'), preserved[i])
    result = result.replace(new RegExp(`<x id="${i}"/>`, 'g'), preserved[i])
  }

  return result
}

async function translateAll(): Promise<void> {
  const files = getFilesToTranslate()
  const existing = getExistingTranslations()
  const languages = Object.keys(LANGUAGES)

  console.log('=== Starting Translation ===\n')

  let completed = 0
  let total = 0

  for (const file of files) {
    const existingLangs = existing.get(file) || new Set()
    total += languages.filter(l => !existingLangs.has(l)).length
  }

  console.log(`Total translations needed: ${total}\n`)

  for (const file of files) {
    const existingLangs = existing.get(file) || new Set()

    for (const lang of languages) {
      if (existingLangs.has(lang)) {
        continue
      }

      try {
        await translateFile(file, lang)
        completed++
        console.log(`  Progress: ${completed}/${total}\n`)
        await sleep(1000)
      } catch (error) {
        console.error(`Error translating ${file} to ${lang}:`, error)
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
