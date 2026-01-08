---
date: 2023-06-18
title: Dezvoltă, testează și implementează extensiile tale pentru toate CI-urile populare dintr-o singură bază de cod
description: Sau cum am implementat-o pentru Qodana
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
translationKey: notes/ci-ext-monorepo
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 Imaginea de prezentare arată un pipeline CI/CD tipic în acțiune, desenat parțial de OpenAI DALL-E, dar în acest articol vom dezvolta ceva cu adevărat benefic

> [!info]- Cuprins
> Acest tutorial demonstrează cum să dezvolți, testezi
> și să implementezi extensii CI pentru GitHub Actions, Azure Pipelines
> și CircleCI dintr-un singur monorepo folosind TypeScript și Node.js.
> Acoperă crearea unui monorepo, partajarea codului între acțiuni și task-uri, și construirea și publicarea extensiilor.
> #### Cuprins
><!-- TOC -->
>* [Începe cu șabloanele oficiale](#începe-cu-șabloanele-oficiale)
>    * [Avantaje pentru folosirea acțiunilor bazate pe JS:](#avantaje-pentru-folosirea-acțiunilor-bazate-pe-js)
>    * [Dezavantaje](#dezavantaje)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Creează monorepo-ul](#creează-monorepo-ul)
>* [Partajează codul între acțiuni și task-uri](#partajează-codul-între-acțiuni-și-task-uri)
>* [Construiește și publică](#construiește-și-publică)
>* [CircleCI?](#circleci)
><!-- TOC -->

Acesta este un tutorial relativ scurt despre cum să dezvolți, testezi și să implementezi extensiile tale CI pentru GitHub Actions, Azure Pipelines și CircleCI dintr-un singur monorepo și se bazează pe experiența de creare a [extensiilor Qodana CI](https://github.com/JetBrains/qodana-action).

## Începe cu șabloanele oficiale

Să alegem stiva tehnologică pentru extensiile noastre CI.

OK, nu voi alege. Îți voi spune doar de ce am folosit TypeScript și node.js pentru extensii.

#### Avantaje pentru folosirea acțiunilor bazate pe JS
- Mai flexible decât abordările bazate pe bash/Dockerfile
  - Diferite biblioteci (precum [actions/toolkit](https://github.com/actions/toolkit) și [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) cu API-uri mai accesibile și ușor de utilizat sunt disponibile din cutie
- Scrierea testelor este relativ simplă

#### Dezavantaje
- JavaScript

Deci să scriem o acțiune bazată pe TypeScript!


### GitHub Actions

Am găsit documentația GitHub Actions mai ușor de citit decât Azure, așa că aș recomanda să începi scriind și testând extensiile tale pe GitHub folosind șablonul oficial [actions/typescript-action](https://github.com/actions/typescript-action). Șablonul menționat oferă un punct de plecare bun; nu voi repeta pașii aici. Joacă-te cu el, scrie niște lucruri simple și apoi revino aici pentru pașii următori.

### Azure Pipelines

GitHub Actions sunt construite pe infrastructura Azure, așa că portarea acțiunii tale GitHub în Azure Pipelines ar trebui să fie relativ ușoară.

Deci,
- "action" devine "task"
- este împachetat puțin diferit, distribuit și instalat altfel

Iar definiția unui task `task.json` este aceeași cu cea a acțiunii `action.yml`.

De exemplu, având următorul `action.yml`:

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

Se traduce "ușor" în următorul task Azure:

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

Dintr-un exemplu atât de simplu, se poate vedea de ce am sugerat să începi cu GitHub Actions. Dar să continuăm.

Pentru a începe să dezvolți noul tău task strălucitor pentru Azure Pipelines, sugerez să copiezi pur și simplu directorul acțiunii și apoi să implementezi pașii din [documentația oficială Azure](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – este destul de simplu.
1. Creează `vss-extension.json`
2. Creează `task.json` și plasează-l în directorul tău `dist` (de fapt, este mai bine să îl denumești după numele task-ului)
3. Dacă ai folosit orice metode din `@actions/core` sau `@actions/github` în acțiunea ta, trebuie să le înlocuiești cu metodele corespunzătoare din `azure-pipelines-task-lib` (de ex. `core.getInput` -> `tl.getInput`)

API-ul `azure-pipelines-task-lib` este similar cu `@actions/core` și alte biblioteci `@actions/*`.
De exemplu, avem o metodă pentru obținerea parametrilor de intrare:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Și același lucru pentru Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Pentru cazuri mai reale, explorează libremente codul nostru Qodana GitHub Actions [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) și task-ul Azure Pipelines [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts).


## Creează monorepo-ul

Vom folosi [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) pentru a gestiona monorepo-ul.
Plasează codul acțiunii și task-ului tău în subdirectoare (de ex. `github`) ale monorepo-ului tău nou creat. Apoi creează un fișier `package.json` în directorul rădăcină.

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

Deci structura monorepo-ului arată astfel:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

După implementarea configurării workspace-ului, poți rula task-uri și acțiuni din directorul rădăcină. De exemplu, pentru a rula task-ul `build` din directorul `github`, poți folosi următoarea comandă:

```bash
npm run -w github build
```

## Partajează codul între acțiuni și task-uri

Cea mai valoroasă parte din utilizarea abordării monorepo începe aici: poți partaja codul între acțiunile și task-urile tale.

Vom urma următorii pași:
1. Creează un director `common` în rădăcina monorepo-ului, un subproiect pentru codul partajat
2. Actualizează configurările compilatorului `tsconfig.json` din toate subdirectoarele pentru build-uri corecte ale proiectului

Mai întâi, să creăm `tsconfig` de bază – `tsconfig.base.json` cu setările de bază care vor fi folosite în toate subproiectele:
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
Apoi creează un `tsconfig.json` simplu în rădăcina proiectului:

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

Apoi `common/tsconfig.json`:

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

Și în final, actualizează fișierele `tsconfig.json` în subproiecte (sunt practic la fel, de ex. `github/tsconfig.json`):

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

Acum poți folosi codul partajat din directorul `common` în acțiunile și task-urile tale. De exemplu, avem un fișier `qodana.ts` în directorul `common` care conține funcția [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) care returnează URL-ul către instrumentul Qodana CLI. Și o [folosim](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) în ambele acțiuni și task-uri.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Construiește și publică

Ai deja workflow-uri GitHub din șablon configurate pentru a publica acțiunile tale în release-urile repository-ului tău.
Pentru release-uri automate, folosim GH CLI și avem un script simplu care publică un changelog în release-urile repository-ului:

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

Și workflow-ul GitHub care îl rulează:

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

Pentru release-urile task-urilor Azure Pipelines, poți folosi abordarea oficială de la Azure. Totuși, poți face același lucru pe infrastructura GitHub Actions deoarece instrumentul lor de publicare poate fi instalat oriunde. Deci, în cazul nostru, este rezolvat printr-un simplu job de workflow GitHub:

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

Cu această configurație, fiecare release se întâmplă automat la fiecare push de tag.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ah, da, acest articol a menționat și orb-ul CircleCI... Configurarea CircleCI este simplă, dar nu suportă extensii TypeScript, așa că trebuie să împachetezi codul într-o imagine Docker sau un binar și să îl rulezi acolo. Singurul motiv pentru care este inclus în acest post este că construim orb-ul nostru cu abordarea monorepo, care funcționează bine.

Implementează [șablonul oficial de orb](https://circleci.com/docs/2.0/orb-author/#quick-start)
și plasează-l în monorepo-ul tău,
astfel încât structura să arate astfel:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

Și amintește-ți să faci commit la directorul `.circleci/` în repository-ul tău pentru a permite CircleCI să facă lint, test și să publice orb-ul tău.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
