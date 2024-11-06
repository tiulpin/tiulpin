---
date: 2023-06-18
title: Develop, test, and deploy your extensions for all popular CIs from a single codebase
description: Or how I implemented it for Qodana
tags:
  - github-actions
  - circleci
  - azure
  - education
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 The feature image shows a typical CI/CD pipeline in action partly drawn by OpenAI DALL-E, but in this article, we are going to develop something beneficial

> [!info]- Contents
> This tutorial demonstrates how to develop, test,
> and deploy CI extensions for GitHub Actions, Azure Pipelines,
> and CircleCI from a single monorepo using TypeScript and Node.js.
> It covers creating a monorepo, sharing code between actions and tasks, and building and publishing extensions. 
> #### Table of Contents
><!-- TOC -->
>* [Start from the official templates](#start-from-the-official-templates)
>    * [Pros for using JS-based actions:](#pros-for-using-js-based-actions)
>    * [Cons](#cons)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Create the monorepo](#create-the-monorepo)
>* [Share code between actions and tasks](#share-code-between-actions-and-tasks)
>* [Build and publish](#build-and-publish)
>* [CircleCI?](#circleci)
><!-- TOC -->

This is a relatively short tutorial on how to develop, test, and deploy your CI extensions for GitHub Actions, Azure Pipelines, and CircleCI from a single monorepo and is based on the experience of creating the [Qodana CI extensions](https://github.com/JetBrains/qodana-action).

## Start from the official templates

Let's pick the technology stack for our CI extensions.

OK, I will not pick. I'll just tell you why I used TypeScript and node.js for the extensions.

#### Pros for using JS-based actions
- More flexible than bash/Dockerfile-based approaches
  - Different libraries (like [actions/toolkit](https://github.com/actions/toolkit) and [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) with more accessible and easy-to-use APIs are available out-of-box
- Writing tests is relatively simple

#### Cons
- JavaScript

So let's write a TypeScript-based action!


### GitHub Actions

I found the GitHub actions documentation easier to read than Azure, so I would recommend starting writing and testing your extensions on GitHub by using the official template [actions/typescript-action](https://github.com/actions/typescript-action). The mentioned template provides a good starting point; I won't repeat the steps here. Play with it, write some simple stuff, and then return here for the next steps.

### Azure Pipelines

GitHub Actions are built on Azure infrastructure, so porting your GitHub action to Azure Pipelines should be relatively easy.

So,
- the "action" becomes the "task"
- it's packed a bit differently, distributed, and installed the other way

And the definition of a task `task.json` is the same as the action one `action.yml`.

For example, having the following `action.yml`:

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

"Easily" translates to the following Azure task:

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

From such a simple example, one can see why I suggested starting with GitHub Actions. But let's continue.

To start developing your new shiny Azure Pipelines task, I suggest just copying the action directory and then implementing steps from [the official Azure documentation](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – it's pretty straightforward.
1. Create `vss-extension.json`
2. Create `task.json` and place it into your `dist` directory (actually better to name it after the task name)
3. If you used any methods from `@actions/core` or `@actions/github` in your action, you need to replace them with the corresponding methods from `azure-pipelines-task-lib` (e.g. `core.getInput` -> `tl.getInput`)

The API of `azure-pipelines-task-lib` is similar to `@actions/core` and other `@actions/*` libraries.
For example, we have a method for getting the input parameters:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

And the same for Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

For more real cases, feel free to explore our Qodana GitHub Actions codebase [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) and Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts).


## Create the monorepo

We are going to use [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to manage the monorepo.
Place your action and task code into subdirectories (e.g. `github`) of your newly created monorepo. And then create a `package.json` file in the root directory.

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

So the monorepo structure looks like this:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

After implementing the workspace setup, you can run tasks and actions from the root directory. For example, to run the `build` task from the `github` directory, you can use the following command:

```bash
npm run -w github build 
```

## Share code between actions and tasks

The most valuable part from using the monorepo approach starts here: you can share the code between your actions and tasks.

We are going to do the following steps:
1. Create a `common` directory in the root of the monorepo, a subproject for shared code
2. Update `tsconfig.json` compiler configurations from all sub-dirs for proper project builds

At first, let's create the base `tsconfig` – `tsconfig.base.json` with the base settings that are going to be used in all subprojects:
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
Then create a simple `tsconfig.json` in the project root:

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

Then `common/tsconfig.json`:

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

And finally, update the `tsconfig.json` files in the subprojects (they are basically the same, e.g. `github/tsconfig.json`):

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

Now you can use the shared code from the `common` directory in your actions and tasks. For example, we have a `qodana.ts` file in the `common` directory that contains function [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) that returns the URL to the Qodana CLI tool. And we [use it](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) in both actions and tasks.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Build and publish

You already have GitHub workflows from the template configured to publish your actions to your repository releases.
For automated releases, we use GH CLI, and we have a simple script that publishes a changelog to the repository releases:

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

And the GitHub workflow that runs it:

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

For Azure Pipelines task releases, you can use the official approach from Azure. Still, also you can do the same on GitHub actions infrastructure as their publisher tool can be installed anywhere. So, in our case, it's solved by a simple GitHub workflow job:

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

With this setup, each release happens automatically on each tag push.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ah, yes, this article mentioned the CircleCI orb also... CircleCI setup is straightforward but does not support TypeScript extensions, so you have to pack your code into a Docker image or a binary and run it there. The only reason it's included in this post is that we build our orb with the monorepo approach, which works well.

Implement [the official orb template](https://circleci.com/docs/2.0/orb-author/#quick-start)
and place it in your monorepo,
so the structure looks like this:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

And remember to commit `.circleci/` directory to your repository to make CircleCI lint, test, and publish your orb.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
