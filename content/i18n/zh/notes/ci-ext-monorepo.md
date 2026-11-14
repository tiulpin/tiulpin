---
date: 2023-06-18
title: 从单一代码库开发、测试和部署所有主流CI的扩展
description: 或者说我是如何为 Qodana 实现的
translationKey: notes/ci-ext-monorepo
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 题图展示了一个典型的 CI/CD 流水线运行中的场景,部分由 OpenAI DALL-E 绘制,但在本文中,我们将开发一些真正有用的东西

> [!info]- 目录
> 本教程演示如何使用 TypeScript 和 Node.js 从单一 monorepo 中开发、测试和部署用于 GitHub Actions、Azure Pipelines 和 CircleCI 的 CI 扩展。
> 它涵盖了创建 monorepo、在 actions 和 tasks 之间共享代码以及构建和发布扩展。
> #### 目录
><!-- TOC -->
>* [从官方模板开始](#从官方模板开始)
>    * [使用基于 JS 的 actions 的优点](#使用基于-js-的-actions-的优点)
>    * [缺点](#缺点)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [创建 monorepo](#创建-monorepo)
>* [在 actions 和 tasks 之间共享代码](#在-actions-和-tasks-之间共享代码)
>* [构建和发布](#构建和发布)
>* [CircleCI?](#circleci)
><!-- TOC -->

这是一个相对简短的教程,介绍如何从单一 monorepo 中开发、测试和部署用于 GitHub Actions、Azure Pipelines 和 CircleCI 的 CI 扩展,基于创建 [Qodana CI 扩展](https://github.com/JetBrains/qodana-action)的经验。

## 从官方模板开始

让我们为 CI 扩展选择技术栈。

好吧,我不选了。我只是告诉你为什么我为这些扩展使用 TypeScript 和 node.js。

#### 使用基于 JS 的 actions 的优点
- 比基于 bash/Dockerfile 的方法更灵活
  - 开箱即用提供不同的库(如 [actions/toolkit](https://github.com/actions/toolkit) 和 [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)),API 更易访问和使用
- 编写测试相对简单

#### 缺点
- JavaScript

所以让我们编写一个基于 TypeScript 的 action!


### GitHub Actions

我发现 GitHub actions 文档比 Azure 的更容易阅读,所以我建议使用官方模板 [actions/typescript-action](https://github.com/actions/typescript-action) 在 GitHub 上开始编写和测试你的扩展。提到的模板提供了一个很好的起点;我不会在这里重复这些步骤。试试它,写一些简单的东西,然后回到这里进行下一步。

### Azure Pipelines

GitHub Actions 是建立在 Azure 基础设施上的,所以将你的 GitHub action 移植到 Azure Pipelines 应该相对容易。

所以,
- "action" 变成了 "task"
- 它的打包方式略有不同,分发和安装方式也不同

并且 task 的定义 `task.json` 与 action 的定义 `action.yml` 是相同的。

例如,有以下 `action.yml`:

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

"轻松"转换为以下 Azure task:

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

从这样一个简单的例子中,可以看出为什么我建议从 GitHub Actions 开始。但让我们继续。

要开始开发你的新 Azure Pipelines task,我建议只需复制 action 目录,然后执行[官方 Azure 文档](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops)中的步骤——它非常简单。
1. 创建 `vss-extension.json`
2. 创建 `task.json` 并将其放入你的 `dist` 目录(实际上最好以 task 名称命名它)
3. 如果你在 action 中使用了 `@actions/core` 或 `@actions/github` 的任何方法,你需要用 `azure-pipelines-task-lib` 的相应方法替换它们(例如 `core.getInput` -> `tl.getInput`)

`azure-pipelines-task-lib` 的 API 与 `@actions/core` 和其他 `@actions/*` 库类似。
例如,我们有一个获取输入参数的方法:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Azure Pipelines 也是一样的:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

对于更多实际案例,请随意浏览我们的 Qodana GitHub Actions 代码库 [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) 和 Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts)。


## 创建 monorepo

我们将使用 [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) 来管理 monorepo。
将你的 action 和 task 代码放入你新创建的 monorepo 的子目录(例如 `github`)中。然后在根目录中创建一个 `package.json` 文件。

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

所以 monorepo 结构如下:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

实现 workspace 设置后,你可以从根目录运行 tasks 和 actions。例如,要从 `github` 目录运行 `build` task,你可以使用以下命令:

```bash
npm run -w github build
```

## 在 actions 和 tasks 之间共享代码

使用 monorepo 方法最有价值的部分从这里开始:你可以在 actions 和 tasks 之间共享代码。

我们将执行以下步骤:
1. 在 monorepo 的根目录中创建一个 `common` 目录,这是一个用于共享代码的子项目
2. 更新所有子目录的 `tsconfig.json` 编译器配置以进行适当的项目构建

首先,让我们创建基础 `tsconfig` - `tsconfig.base.json`,其中包含将在所有子项目中使用的基本设置:
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
然后在项目根目录创建一个简单的 `tsconfig.json`:

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

然后是 `common/tsconfig.json`:

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

最后,更新子项目中的 `tsconfig.json` 文件(它们基本相同,例如 `github/tsconfig.json`):

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

现在你可以在 actions 和 tasks 中使用 `common` 目录中的共享代码。例如,我们在 `common` 目录中有一个 `qodana.ts` 文件,其中包含函数 [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21),它返回 Qodana CLI 工具的 URL。我们在 actions 和 tasks 中都[使用它](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code)。

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## 构建和发布

你已经从模板配置了 GitHub workflows 来将你的 actions 发布到你的仓库 releases。
对于自动化发布,我们使用 GH CLI,我们有一个简单的脚本将 changelog 发布到仓库 releases:

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

以及运行它的 GitHub workflow:

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

对于 Azure Pipelines task 发布,你可以使用 Azure 的官方方法。但你也可以在 GitHub actions 基础设施上做同样的事情,因为他们的发布工具可以安装在任何地方。所以,在我们的情况下,它通过一个简单的 GitHub workflow job 解决:

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

通过这种设置,每次 tag 推送都会自动进行发布。

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

啊,是的,这篇文章还提到了 CircleCI orb... CircleCI 设置很简单,但不支持 TypeScript 扩展,所以你必须将代码打包成 Docker 镜像或二进制文件并在那里运行。它被包含在这篇文章中的唯一原因是我们使用 monorepo 方法构建我们的 orb,这很有效。

实现[官方 orb 模板](https://circleci.com/docs/orbs/author/creating-orbs/)
并将其放在你的 monorepo 中,
所以结构如下:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

记得将 `.circleci/` 目录提交到你的仓库,以使 CircleCI lint、测试和发布你的 orb。

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
