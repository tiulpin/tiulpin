---
date: 2023-06-18
title: Développez, testez et déployez vos extensions pour tous les CIs populaires depuis une seule base de code
description: Ou comment je l'ai implémenté pour Qodana
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
translationKey: notes/ci-ext-monorepo
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 L'image de présentation montre un pipeline CI/CD typique en action, partiellement dessiné par OpenAI DALL-E, mais dans cet article, nous allons développer quelque chose de bénéfique

> [!info]- Contenu
> Ce tutoriel démontre comment développer, tester et déployer des extensions CI pour GitHub Actions, Azure Pipelines et CircleCI depuis un seul monorepo en utilisant TypeScript et Node.js.
> Il couvre la création d'un monorepo, le partage de code entre actions et tâches, ainsi que la construction et la publication d'extensions.
> #### Table des matières
><!-- TOC -->
>* [Commencer avec les templates officiels](#commencer-avec-les-templates-officiels)
>    * [Avantages de l'utilisation d'actions basées sur JS :](#avantages-de-lutilisation-dactions-basées-sur-js-)
>    * [Inconvénients](#inconvénients)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Créer le monorepo](#créer-le-monorepo)
>* [Partager le code entre actions et tâches](#partager-le-code-entre-actions-et-tâches)
>* [Construire et publier](#construire-et-publier)
>* [CircleCI ?](#circleci-)
><!-- TOC -->

Ceci est un tutoriel relativement court sur comment développer, tester et déployer vos extensions CI pour GitHub Actions, Azure Pipelines et CircleCI depuis un seul monorepo et est basé sur l'expérience de création des [extensions CI Qodana](https://github.com/JetBrains/qodana-action).

## Commencer avec les templates officiels

Choisissons la pile technologique pour nos extensions CI.

OK, je ne choisirai pas. Je vais juste vous dire pourquoi j'ai utilisé TypeScript et node.js pour les extensions.

#### Avantages de l'utilisation d'actions basées sur JS
- Plus flexible que les approches basées sur bash/Dockerfile
  - Différentes bibliothèques (comme [actions/toolkit](https://github.com/actions/toolkit) et [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) avec des APIs plus accessibles et faciles à utiliser sont disponibles prêtes à l'emploi
- L'écriture de tests est relativement simple

#### Inconvénients
- JavaScript

Alors écrivons une action basée sur TypeScript !


### GitHub Actions

J'ai trouvé la documentation de GitHub Actions plus facile à lire qu'Azure, donc je recommanderais de commencer à écrire et tester vos extensions sur GitHub en utilisant le template officiel [actions/typescript-action](https://github.com/actions/typescript-action). Le template mentionné fournit un bon point de départ ; je ne répéterai pas les étapes ici. Jouez avec, écrivez quelques trucs simples, puis revenez ici pour les prochaines étapes.

### Azure Pipelines

GitHub Actions est construit sur l'infrastructure Azure, donc porter votre action GitHub vers Azure Pipelines devrait être relativement facile.

Donc,
- l'"action" devient la "tâche"
- elle est empaquetée un peu différemment, distribuée et installée d'une autre manière

Et la définition d'une tâche `task.json` est la même que celle de l'action `action.yml`.

Par exemple, en ayant le `action.yml` suivant :

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

Se traduit "facilement" en la tâche Azure suivante :

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

À partir d'un exemple aussi simple, on peut voir pourquoi j'ai suggéré de commencer avec GitHub Actions. Mais continuons.

Pour commencer à développer votre nouvelle tâche Azure Pipelines brillante, je suggère simplement de copier le répertoire d'action puis d'implémenter les étapes de [la documentation officielle Azure](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – c'est assez simple.
1. Créer `vss-extension.json`
2. Créer `task.json` et le placer dans votre répertoire `dist` (en fait mieux de le nommer d'après le nom de la tâche)
3. Si vous avez utilisé des méthodes de `@actions/core` ou `@actions/github` dans votre action, vous devez les remplacer par les méthodes correspondantes de `azure-pipelines-task-lib` (par exemple `core.getInput` -> `tl.getInput`)

L'API de `azure-pipelines-task-lib` est similaire à `@actions/core` et autres bibliothèques `@actions/*`.
Par exemple, nous avons une méthode pour obtenir les paramètres d'entrée :

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Et la même pour Azure Pipelines :

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Pour des cas plus réels, n'hésitez pas à explorer notre base de code GitHub Actions Qodana [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) et Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts).


## Créer le monorepo

Nous allons utiliser [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) pour gérer le monorepo.
Placez votre code d'action et de tâche dans des sous-répertoires (par exemple `github`) de votre monorepo nouvellement créé. Ensuite, créez un fichier `package.json` dans le répertoire racine.

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

Donc la structure du monorepo ressemble à ceci :

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Après avoir implémenté la configuration du workspace, vous pouvez exécuter des tâches et des actions depuis le répertoire racine. Par exemple, pour exécuter la tâche `build` depuis le répertoire `github`, vous pouvez utiliser la commande suivante :

```bash
npm run -w github build
```

## Partager le code entre actions et tâches

La partie la plus précieuse de l'utilisation de l'approche monorepo commence ici : vous pouvez partager le code entre vos actions et tâches.

Nous allons effectuer les étapes suivantes :
1. Créer un répertoire `common` à la racine du monorepo, un sous-projet pour le code partagé
2. Mettre à jour les configurations du compilateur `tsconfig.json` de tous les sous-répertoires pour des builds de projet appropriés

Tout d'abord, créons le `tsconfig` de base – `tsconfig.base.json` avec les paramètres de base qui vont être utilisés dans tous les sous-projets :
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
Ensuite, créez un simple `tsconfig.json` à la racine du projet :

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

Puis `common/tsconfig.json` :

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

Et enfin, mettez à jour les fichiers `tsconfig.json` dans les sous-projets (ils sont fondamentalement les mêmes, par exemple `github/tsconfig.json`) :

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

Maintenant vous pouvez utiliser le code partagé du répertoire `common` dans vos actions et tâches. Par exemple, nous avons un fichier `qodana.ts` dans le répertoire `common` qui contient la fonction [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) qui retourne l'URL de l'outil CLI Qodana. Et nous [l'utilisons](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) dans les actions et les tâches.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Construire et publier

Vous avez déjà des workflows GitHub du template configurés pour publier vos actions dans les releases de votre dépôt.
Pour les releases automatisées, nous utilisons GH CLI, et nous avons un script simple qui publie un changelog dans les releases du dépôt :

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

Et le workflow GitHub qui l'exécute :

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

Pour les releases de tâches Azure Pipelines, vous pouvez utiliser l'approche officielle d'Azure. Néanmoins, vous pouvez également faire la même chose sur l'infrastructure GitHub Actions car leur outil de publication peut être installé n'importe où. Donc, dans notre cas, c'est résolu par un simple job de workflow GitHub :

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

Avec cette configuration, chaque release se produit automatiquement à chaque push de tag.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI ?

Ah oui, cet article mentionnait également l'orb CircleCI... La configuration CircleCI est simple mais ne prend pas en charge les extensions TypeScript, vous devez donc empaqueter votre code dans une image Docker ou un binaire et l'exécuter là-bas. La seule raison pour laquelle c'est inclus dans cet article est que nous construisons notre orb avec l'approche monorepo, ce qui fonctionne bien.

Implémentez [le template d'orb officiel](https://circleci.com/docs/2.0/orb-author/#quick-start)
et placez-le dans votre monorepo,
donc la structure ressemble à ceci :

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

Et n'oubliez pas de committer le répertoire `.circleci/` dans votre dépôt pour que CircleCI puisse linter, tester et publier votre orb.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
