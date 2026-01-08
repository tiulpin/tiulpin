---
date: 2023-06-18
title: Ontwikkel, test en implementeer je extensies voor alle populaire CI's vanuit één codebase
description: Of hoe ik het implementeerde voor Qodana
translationKey: notes/ci-ext-monorepo
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 De afbeelding toont een typische CI/CD-pipeline in actie, deels getekend door OpenAI DALL-E, maar in dit artikel gaan we iets nuttigs ontwikkelen

> [!info]- Inhoud
> Deze tutorial demonstreert hoe je CI-extensies voor GitHub Actions, Azure Pipelines en CircleCI kunt ontwikkelen, testen en implementeren vanuit een enkele monorepo met TypeScript en Node.js.
> Het behandelt het maken van een monorepo, code delen tussen actions en tasks, en het bouwen en publiceren van extensies.
> #### Inhoudsopgave
><!-- TOC -->
>* [Begin met de officiële templates](#begin-met-de-officiële-templates)
>    * [Voordelen van JS-gebaseerde actions:](#voordelen-van-js-gebaseerde-actions)
>    * [Nadelen](#nadelen)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Maak de monorepo](#maak-de-monorepo)
>* [Deel code tussen actions en tasks](#deel-code-tussen-actions-en-tasks)
>* [Bouwen en publiceren](#bouwen-en-publiceren)
>* [CircleCI?](#circleci)
><!-- TOC -->

Dit is een relatief korte tutorial over hoe je je CI-extensies voor GitHub Actions, Azure Pipelines en CircleCI kunt ontwikkelen, testen en implementeren vanuit een enkele monorepo en is gebaseerd op de ervaring met het maken van de [Qodana CI-extensies](https://github.com/JetBrains/qodana-action).

## Begin met de officiële templates

Laten we de technologiestack voor onze CI-extensies kiezen.

OK, ik zal niet kiezen. Ik vertel je gewoon waarom ik TypeScript en node.js gebruikte voor de extensies.

#### Voordelen van JS-gebaseerde actions
- Flexibeler dan bash/Dockerfile-gebaseerde benaderingen
  - Verschillende bibliotheken (zoals [actions/toolkit](https://github.com/actions/toolkit) en [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) met toegankelijkere en gebruiksvriendelijkere API's zijn direct beschikbaar
- Tests schrijven is relatief eenvoudig

#### Nadelen
- JavaScript

Dus laten we een TypeScript-gebaseerde action schrijven!


### GitHub Actions

Ik vond de GitHub Actions-documentatie gemakkelijker te lezen dan die van Azure, dus ik zou aanraden te beginnen met het schrijven en testen van je extensies op GitHub door de officiële template [actions/typescript-action](https://github.com/actions/typescript-action) te gebruiken. De genoemde template biedt een goed startpunt; ik zal de stappen hier niet herhalen. Speel ermee, schrijf wat eenvoudige dingen, en kom dan hier terug voor de volgende stappen.

### Azure Pipelines

GitHub Actions zijn gebouwd op Azure-infrastructuur, dus het porten van je GitHub action naar Azure Pipelines zou relatief eenvoudig moeten zijn.

Dus,
- de "action" wordt de "task"
- het wordt iets anders verpakt, gedistribueerd en geïnstalleerd

En de definitie van een task `task.json` is hetzelfde als die van de action `action.yml`.

Bijvoorbeeld, met de volgende `action.yml`:

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

Vertaalt "gemakkelijk" naar de volgende Azure task:

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

Uit zo'n eenvoudig voorbeeld kun je zien waarom ik voorstelde om met GitHub Actions te beginnen. Maar laten we doorgaan.

Om te beginnen met het ontwikkelen van je nieuwe glanzende Azure Pipelines task, raad ik aan om gewoon de action-directory te kopiëren en vervolgens stappen uit [de officiële Azure-documentatie](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) te implementeren – het is vrij eenvoudig.
1. Maak `vss-extension.json`
2. Maak `task.json` en plaats het in je `dist` directory (eigenlijk beter om het naar de tasknaam te noemen)
3. Als je methoden van `@actions/core` of `@actions/github` in je action gebruikte, moet je deze vervangen door de overeenkomstige methoden van `azure-pipelines-task-lib` (bijv. `core.getInput` -> `tl.getInput`)

De API van `azure-pipelines-task-lib` is vergelijkbaar met `@actions/core` en andere `@actions/*` bibliotheken.
Bijvoorbeeld, we hebben een methode voor het ophalen van de invoerparameters:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

En hetzelfde voor Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Voor meer realistische gevallen kun je gerust onze Qodana GitHub Actions codebase [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) en Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts) verkennen.


## Maak de monorepo

We gaan [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) gebruiken om de monorepo te beheren.
Plaats je action- en task-code in subdirectories (bijv. `github`) van je nieuw aangemaakte monorepo. En maak dan een `package.json` bestand in de root directory.

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

Dus de monorepo-structuur ziet er zo uit:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Na het implementeren van de workspace-setup kun je taken en actions uitvoeren vanuit de root directory. Om bijvoorbeeld de `build` task uit de `github` directory uit te voeren, kun je het volgende commando gebruiken:

```bash
npm run -w github build
```

## Deel code tussen actions en tasks

Het meest waardevolle deel van het gebruik van de monorepo-benadering begint hier: je kunt de code delen tussen je actions en tasks.

We gaan de volgende stappen uitvoeren:
1. Maak een `common` directory in de root van de monorepo, een subproject voor gedeelde code
2. Update `tsconfig.json` compiler-configuraties van alle subdirectories voor correcte projectbuilds

Laten we eerst de basis `tsconfig` maken – `tsconfig.base.json` met de basisinstellingen die in alle subprojecten gebruikt worden:
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
Maak dan een eenvoudige `tsconfig.json` in de projectroot:

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

Vervolgens `common/tsconfig.json`:

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

En tenslotte, update de `tsconfig.json` bestanden in de subprojecten (ze zijn in principe hetzelfde, bijv. `github/tsconfig.json`):

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

Nu kun je de gedeelde code uit de `common` directory gebruiken in je actions en tasks. Bijvoorbeeld, we hebben een `qodana.ts` bestand in de `common` directory dat de functie [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) bevat die de URL naar de Qodana CLI-tool retourneert. En we [gebruiken het](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) in zowel actions als tasks.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Bouwen en publiceren

Je hebt al GitHub workflows van de template geconfigureerd om je actions te publiceren naar je repository releases.
Voor geautomatiseerde releases gebruiken we GH CLI, en we hebben een eenvoudig script dat een changelog publiceert naar de repository releases:

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

En de GitHub workflow die het uitvoert:

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

Voor Azure Pipelines task releases kun je de officiële benadering van Azure gebruiken. Maar je kunt ook hetzelfde doen op GitHub Actions-infrastructuur, omdat hun publisher-tool overal geïnstalleerd kan worden. Dus in ons geval wordt het opgelost door een eenvoudige GitHub workflow job:

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

Met deze setup gebeurt elke release automatisch bij elke tag push.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ah, ja, dit artikel noemde ook de CircleCI orb... De CircleCI-setup is eenvoudig maar ondersteunt geen TypeScript-extensies, dus je moet je code in een Docker-image of een binary verpakken en daar uitvoeren. De enige reden dat het in dit bericht is opgenomen, is dat we onze orb bouwen met de monorepo-benadering, die goed werkt.

Implementeer [de officiële orb template](https://circleci.com/docs/2.0/orb-author/#quick-start)
en plaats het in je monorepo,
dus de structuur ziet er zo uit:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

En vergeet niet om de `.circleci/` directory te committen naar je repository om CircleCI je orb te laten linten, testen en publiceren.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
