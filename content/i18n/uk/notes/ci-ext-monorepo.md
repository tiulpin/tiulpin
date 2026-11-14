---
date: 2023-06-18
title: Розробляйте, тестуйте та розгортайте свої розширення для всіх популярних CI з єдиної кодової бази
description: Або як я реалізував це для Qodana
translationKey: notes/ci-ext-monorepo
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 Зображення на обкладинці показує типовий CI/CD конвеєр у дії, частково намальований OpenAI DALL-E, але в цій статті ми збираємося розробити щось корисне

> [!info]- Зміст
> Цей туторіал демонструє, як розробляти, тестувати та розгортати розширення для CI для GitHub Actions, Azure Pipelines та CircleCI з єдиного монорепозиторію, використовуючи TypeScript та Node.js.
> Він охоплює створення монорепозиторію, спільне використання коду між actions та tasks, а також збірку та публікацію розширень.
> #### Зміст
><!-- TOC -->
>* [Почніть з офіційних шаблонів](#почніть-з-офіційних-шаблонів)
>    * [Переваги використання actions на основі JS:](#переваги-використання-actions-на-основі-js)
>    * [Недоліки](#недоліки)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Створіть монорепозиторій](#створіть-монорепозиторій)
>* [Спільне використання коду між actions та tasks](#спільне-використання-коду-між-actions-та-tasks)
>* [Збірка та публікація](#збірка-та-публікація)
>* [CircleCI?](#circleci)
><!-- TOC -->

Це відносно короткий туторіал про те, як розробляти, тестувати та розгортати свої розширення для CI для GitHub Actions, Azure Pipelines та CircleCI з єдиного монорепозиторію, і він базується на досвіді створення [розширень Qodana для CI](https://github.com/JetBrains/qodana-action).

## Почніть з офіційних шаблонів

Давайте виберемо технологічний стек для наших розширень CI.

Гаразд, я не буду вибирати. Я просто розповім вам, чому я використовував TypeScript та node.js для розширень.

#### Переваги використання actions на основі JS
- Більш гнучкі, ніж підходи на основі bash/Dockerfile
  - Різні бібліотеки (як [actions/toolkit](https://github.com/actions/toolkit) та [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) з більш доступними та простими у використанні API доступні з коробки
- Написання тестів відносно просте

#### Недоліки
- JavaScript

Тож давайте напишемо action на основі TypeScript!


### GitHub Actions

Я виявив, що документація GitHub Actions простіша для читання, ніж Azure, тому я рекомендую почати писати та тестувати свої розширення на GitHub, використовуючи офіційний шаблон [actions/typescript-action](https://github.com/actions/typescript-action). Згаданий шаблон надає хорошу відправну точку; я не буду повторювати кроки тут. Пограйтеся з ним, напишіть щось просте, а потім поверніться сюди для наступних кроків.

### Azure Pipelines

GitHub Actions побудовано на інфраструктурі Azure, тому портування вашого GitHub action до Azure Pipelines має бути відносно простим.

Отже,
- "action" стає "task"
- він упаковується трохи інакше, розповсюджується та встановлюється по-іншому

І визначення task `task.json` таке саме, як у action `action.yml`.

Наприклад, маючи наступний `action.yml`:

```yaml
name: 'Your name here'
description: 'Provide a description here'
author: 'Your name or organization here'
inputs:
  milliseconds: # change this
    required: true
    description: 'input description here'
    default: 'default value if applicable'
runs:
  using: 'node16'
  main: 'dist/index.js'
```

"Легко" перекладається в наступну задачу Azure:

```json
{
  "$schema": "https://raw.githubusercontent.com/Microsoft/azure-pipelines-task-lib/master/tasks.schema.json",
  "id": "822d6cb9-d4d1-431b-9513-e7db7d718a49",
  "name": "YourTaskNameHere",
  "friendlyName": "Your name here",
  "description": "Provide a description here",
  "helpMarkDown": "Provide a longer description here",
  "author": "Your name or organization here",
  "version": {
    "Major": 1,
    "Minor": 0,
    "Patch": 0
  },
  "instanceNameFormat": "YourTaskNameHere",
  "inputs": [
    {
      "name": "milliseconds",
      "type": "string",
      "label": "label name here",
      "defaultValue": "default value if applicable",
      "required": true,
      "helpMarkDown": "input description here"
    }
  ],
  "execution": {
    "Node10": {
      "target": "index.js"
    }
  }
}
```

З такого простого прикладу можна побачити, чому я запропонував почати з GitHub Actions. Але давайте продовжимо.

Щоб почати розробляти свою нову яскраву задачу для Azure Pipelines, я пропонію просто скопіювати директорію action, а потім виконати кроки з [офіційної документації Azure](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – це досить просто.
1. Створіть `vss-extension.json`
2. Створіть `task.json` та помістіть його в директорію `dist` (насправді краще назвати його за назвою задачі)
3. Якщо ви використовували будь-які методи з `@actions/core` або `@actions/github` у вашому action, вам потрібно замінити їх відповідними методами з `azure-pipelines-task-lib` (наприклад, `core.getInput` -> `tl.getInput`)

API `azure-pipelines-task-lib` схожий на `@actions/core` та інші бібліотеки `@actions/*`.
Наприклад, у нас є метод для отримання вхідних параметрів:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

І те саме для Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Для більш реальних випадків не соромтеся досліджувати нашу кодову базу Qodana GitHub Actions [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) та Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts).


## Створіть монорепозиторій

Ми збираємося використовувати [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) для управління монорепозиторієм.
Помістіть свій код action та task в піддиректорії (наприклад, `github`) вашого щойно створеного монорепозиторію. А потім створіть файл `package.json` у кореневій директорії.

```json
{
  "name": "@org/ci",
  "version": "1.0.0",
  "description": "Common code for CI extensions",
  "license": "Apache-2.0",
  "workspaces": [
    "github",
    "azure"
  ],
  "devDependencies": {
    "typescript": "latest",
    "eslint": "latest",
    "eslint-plugin-github": "latest",
    "eslint-plugin-jest": "latest",
    "prettier": "latest",
    "ts-node": "latest"
  }
}

```

Тож структура монорепозиторію виглядає так:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Після реалізації налаштування workspace ви можете запускати задачі та actions з кореневої директорії. Наприклад, щоб запустити задачу `build` з директорії `github`, ви можете використовувати наступну команду:

```bash
npm run -w github build
```

## Спільне використання коду між actions та tasks

Найцінніша частина використання підходу з монорепозиторієм починається тут: ви можете спільно використовувати код між вашими actions та tasks.

Ми збираємося виконати наступні кроки:
1. Створити директорію `common` у корені монорепозиторію, підпроєкт для спільного коду
2. Оновити конфігурації компілятора `tsconfig.json` з усіх піддиректорій для правильної збірки проєкту

Спочатку давайте створимо базовий `tsconfig` – `tsconfig.base.json` з базовими налаштуваннями, які будуть використовуватися в усіх підпроєктах:
```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "composite": true
  },
  "exclude": ["node_modules", "**/*.test.ts", "*/lib/**"]
}
```
Потім створіть простий `tsconfig.json` у корені проєкту:

```json
{
  "references": [
    { "path": "common" },
    { "path": "azure" },
    { "path": "github" }
  ],
  "files": []
}
```

Потім `common/tsconfig.json`:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "."
  },
  "files": ["include your files here or use typical include/exclude patterns"]
}
```

І нарешті, оновіть файли `tsconfig.json` у підпроєктах (вони в основному однакові, наприклад, `github/tsconfig.json`):

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../common" }
  ]
}
```

Тепер ви можете використовувати спільний код з директорії `common` у ваших actions та tasks. Наприклад, у нас є файл `qodana.ts` у директорії `common`, який містить функцію [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21), яка повертає URL до інструменту Qodana CLI. І ми [використовуємо його](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) як в actions, так і в tasks.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Збірка та публікація

У вас вже є GitHub workflows з шаблону, налаштовані для публікації ваших actions у релізи вашого репозиторію.
Для автоматизованих релізів ми використовуємо GH CLI, і у нас є простий скрипт, який публікує changelog у релізи репозиторію:

```bash
#!/usr/bin/env bash
previous_tag=0
for current_tag in $(git tag --sort=-creatordate)
do

if [ "$previous_tag" != 0 ];then
    printf "## Changelog\n"
    git log ${current_tag}...${previous_tag} --pretty=format:'* %h %s' --reverse | grep -v Merge
    printf "\n"
    break
fi
previous_tag=${current_tag}
done
```

І GitHub workflow, який його запускає:

```yaml
name: 'Release'
on:
  push:
    tags:
      - '*'
permissions:
  contents: write

jobs:
  github:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - run: |
          ./changelog.sh > changelog.md
          gh release create ${GITHUB_REF##*/} -F changelog.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Для релізів задач Azure Pipelines ви можете використовувати офіційний підхід від Azure. Але також ви можете зробити те саме на інфраструктурі GitHub actions, оскільки їхній інструмент публікації може бути встановлений будь-де. Отже, у нашому випадку це вирішується простою задачею GitHub workflow:

```yaml
  azure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set Node.js 12.x
        uses: actions/setup-node@v3.6.0
        with:
          node-version: 12.x
      - name: Install dependencies
        run: npm ci && cd vsts/QodanaScan && npm ci && npm i -g tfx-cli
      - name: Package and publish
        run: |
          cd vsts && npm run azure
          mv JetBrains.qodana-*.vsix qodana.vsix
          tfx extension publish --publisher JetBrains --vsix qodana.vsix -t $AZURE_TOKEN
        env:
          AZURE_TOKEN: ${{ secrets.AZURE_TOKEN }}
```

З таким налаштуванням кожен реліз відбувається автоматично при кожному push тега.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ах, так, ця стаття згадувала також orb CircleCI... Налаштування CircleCI є простим, але не підтримує розширення TypeScript, тому вам доведеться упакувати свій код у Docker-образ або бінарник і запустити його там. Єдина причина, чому він включений у цей пост, полягає в тому, що ми будуємо наш orb за допомогою підходу з монорепозиторієм, який добре працює.

Реалізуйте [офіційний шаблон orb](https://circleci.com/docs/orbs/author/creating-orbs/)
і помістіть його у ваш монорепозиторій,
щоб структура виглядала так:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

І не забудьте закомітити директорію `.circleci/` у ваш репозиторій, щоб CircleCI міг перевіряти, тестувати та публікувати ваш orb.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
