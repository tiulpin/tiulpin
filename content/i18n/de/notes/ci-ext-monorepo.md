---
date: 2023-06-18
title: Entwickeln, testen und veröffentlichen Sie Ihre Erweiterungen für alle gängigen CIs aus einer einzigen Codebasis
description: Oder wie ich es für Qodana implementiert habe
translationKey: notes/ci-ext-monorepo
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 Das Feature-Bild zeigt eine typische CI/CD-Pipeline in Aktion, teilweise gezeichnet von OpenAI DALL-E, aber in diesem Artikel werden wir etwas Nützliches entwickeln

> [!info]- Inhalt
> Dieses Tutorial zeigt, wie man CI-Erweiterungen für GitHub Actions, Azure Pipelines
> und CircleCI aus einem einzigen Monorepo mit TypeScript und Node.js entwickelt, testet
> und bereitstellt. Es behandelt das Erstellen eines Monorepos, das Teilen von Code zwischen
> Actions und Tasks sowie das Bauen und Veröffentlichen von Erweiterungen.
> #### Inhaltsverzeichnis
><!-- TOC -->
>* [Von den offiziellen Templates starten](#von-den-offiziellen-templates-starten)
>    * [Vorteile für die Verwendung von JS-basierten Actions:](#vorteile-für-die-verwendung-von-js-basierten-actions)
>    * [Nachteile](#nachteile)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Das Monorepo erstellen](#das-monorepo-erstellen)
>* [Code zwischen Actions und Tasks teilen](#code-zwischen-actions-und-tasks-teilen)
>* [Bauen und Veröffentlichen](#bauen-und-veröffentlichen)
>* [CircleCI?](#circleci)
><!-- TOC -->

Dies ist ein relativ kurzes Tutorial darüber, wie man CI-Erweiterungen für GitHub Actions, Azure Pipelines und CircleCI aus einem einzigen Monorepo entwickelt, testet und bereitstellt, und basiert auf der Erfahrung beim Erstellen der [Qodana CI-Erweiterungen](https://github.com/JetBrains/qodana-action).

## Von den offiziellen Templates starten

Wählen wir den Technologie-Stack für unsere CI-Erweiterungen aus.

OK, ich werde nicht auswählen. Ich erkläre Ihnen nur, warum ich TypeScript und Node.js für die Erweiterungen verwendet habe.

#### Vorteile für die Verwendung von JS-basierten Actions
- Flexibler als bash/Dockerfile-basierte Ansätze
  - Verschiedene Bibliotheken (wie [actions/toolkit](https://github.com/actions/toolkit) und [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) mit zugänglicheren und einfach zu verwendenden APIs sind sofort verfügbar
- Das Schreiben von Tests ist relativ einfach

#### Nachteile
- JavaScript

Also schreiben wir eine TypeScript-basierte Action!


### GitHub Actions

Ich fand die GitHub Actions-Dokumentation einfacher zu lesen als Azure, daher würde ich empfehlen, mit dem Schreiben und Testen Ihrer Erweiterungen auf GitHub zu beginnen, indem Sie das offizielle Template [actions/typescript-action](https://github.com/actions/typescript-action) verwenden. Das erwähnte Template bietet einen guten Ausgangspunkt; ich werde die Schritte hier nicht wiederholen. Spielen Sie damit, schreiben Sie einfache Sachen und kommen Sie dann für die nächsten Schritte hierher zurück.

### Azure Pipelines

GitHub Actions basieren auf Azure-Infrastruktur, daher sollte das Portieren Ihrer GitHub Action zu Azure Pipelines relativ einfach sein.

Also,
- die "Action" wird zur "Task"
- sie wird etwas anders gepackt, verteilt und auf andere Weise installiert

Und die Definition einer Task `task.json` ist dieselbe wie die einer Action `action.yml`.

Zum Beispiel, bei folgendem `action.yml`:

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

"Einfach" übersetzt in folgende Azure Task:

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

Aus diesem einfachen Beispiel kann man sehen, warum ich vorgeschlagen habe, mit GitHub Actions zu beginnen. Aber fahren wir fort.

Um mit der Entwicklung Ihrer neuen glänzenden Azure Pipelines Task zu beginnen, schlage ich vor, einfach das Action-Verzeichnis zu kopieren und dann die Schritte aus [der offiziellen Azure-Dokumentation](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) zu implementieren – es ist ziemlich unkompliziert.
1. Erstellen Sie `vss-extension.json`
2. Erstellen Sie `task.json` und platzieren Sie sie in Ihrem `dist`-Verzeichnis (besser, sie nach dem Task-Namen zu benennen)
3. Wenn Sie Methoden von `@actions/core` oder `@actions/github` in Ihrer Action verwendet haben, müssen Sie diese durch die entsprechenden Methoden aus `azure-pipelines-task-lib` ersetzen (z.B. `core.getInput` -> `tl.getInput`)

Die API von `azure-pipelines-task-lib` ist ähnlich wie `@actions/core` und andere `@actions/*`-Bibliotheken.
Zum Beispiel haben wir eine Methode zum Abrufen der Eingabeparameter:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Und das gleiche für Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Für realistischere Fälle können Sie gerne unsere Qodana GitHub Actions-Codebasis [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) und Azure Pipelines Task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts) erkunden.


## Das Monorepo erstellen

Wir werden [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) verwenden, um das Monorepo zu verwalten.
Platzieren Sie Ihren Action- und Task-Code in Unterverzeichnissen (z.B. `github`) Ihres neu erstellten Monorepos. Und erstellen Sie dann eine `package.json`-Datei im Root-Verzeichnis.

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

Die Monorepo-Struktur sieht also so aus:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Nach der Implementierung des Workspace-Setups können Sie Tasks und Actions aus dem Root-Verzeichnis ausführen. Um beispielsweise die `build`-Task aus dem `github`-Verzeichnis auszuführen, können Sie folgenden Befehl verwenden:

```bash
npm run -w github build
```

## Code zwischen Actions und Tasks teilen

Der wertvollste Teil der Verwendung des Monorepo-Ansatzes beginnt hier: Sie können den Code zwischen Ihren Actions und Tasks teilen.

Wir werden folgende Schritte durchführen:
1. Ein `common`-Verzeichnis im Root des Monorepos erstellen, ein Unterprojekt für gemeinsamen Code
2. `tsconfig.json`-Compiler-Konfigurationen aus allen Unterverzeichnissen für ordnungsgemäße Projekt-Builds aktualisieren

Zuerst erstellen wir die Basis-`tsconfig` – `tsconfig.base.json` mit den Basiseinstellungen, die in allen Unterprojekten verwendet werden:
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
Dann erstellen Sie eine einfache `tsconfig.json` im Projekt-Root:

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

Dann `common/tsconfig.json`:

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

Und schließlich aktualisieren Sie die `tsconfig.json`-Dateien in den Unterprojekten (sie sind im Grunde gleich, z.B. `github/tsconfig.json`):

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

Jetzt können Sie den gemeinsamen Code aus dem `common`-Verzeichnis in Ihren Actions und Tasks verwenden. Zum Beispiel haben wir eine `qodana.ts`-Datei im `common`-Verzeichnis, die die Funktion [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) enthält, die die URL zum Qodana CLI-Tool zurückgibt. Und wir [verwenden sie](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) sowohl in Actions als auch in Tasks.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Bauen und Veröffentlichen

Sie haben bereits GitHub Workflows aus dem Template konfiguriert, um Ihre Actions in Ihren Repository-Releases zu veröffentlichen.
Für automatisierte Releases verwenden wir GH CLI und haben ein einfaches Skript, das ein Changelog in den Repository-Releases veröffentlicht:

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

Und der GitHub Workflow, der es ausführt:

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

Für Azure Pipelines Task-Releases können Sie den offiziellen Ansatz von Azure verwenden. Sie können aber auch dasselbe auf der GitHub Actions-Infrastruktur machen, da deren Publisher-Tool überall installiert werden kann. In unserem Fall ist es also durch einen einfachen GitHub Workflow-Job gelöst:

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

Mit diesem Setup erfolgt jedes Release automatisch bei jedem Tag-Push.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ah, ja, dieser Artikel erwähnte auch den CircleCI Orb... Das CircleCI-Setup ist unkompliziert, unterstützt aber keine TypeScript-Erweiterungen, sodass Sie Ihren Code in ein Docker-Image oder eine Binärdatei packen und dort ausführen müssen. Der einzige Grund, warum es in diesem Beitrag enthalten ist, ist, dass wir unseren Orb mit dem Monorepo-Ansatz bauen, der gut funktioniert.

Implementieren Sie [das offizielle Orb-Template](https://circleci.com/docs/2.0/orb-author/#quick-start)
und platzieren Sie es in Ihrem Monorepo,
sodass die Struktur so aussieht:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

Und denken Sie daran, das `.circleci/`-Verzeichnis in Ihr Repository zu committen, damit CircleCI Ihren Orb linten, testen und veröffentlichen kann.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
