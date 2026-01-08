# log.tiulp.in (quartz wiki)

dev:
    npx quartz build --serve

build:
    npx quartz build

sync:
    npx quartz sync

check:
    npm run check

format:
    npm run format

# Translation commands (requires DEEPL_API_KEY in .env)
translate-check:
    npx tsx scripts/translate.ts check

translate:
    npx tsx scripts/translate.ts translate
