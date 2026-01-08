---
date: 2023-06-18
title: 単一のコードベースからすべての主要なCIの拡張機能を開発、テスト、デプロイする
description: Qodanaでの実装方法
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
translationKey: notes/ci-ext-monorepo
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 機能画像は、OpenAI DALL-Eによって部分的に描かれた典型的なCI/CDパイプラインを示していますが、この記事では有益なものを開発します

> [!info]- 目次
> このチュートリアルでは、TypeScriptとNode.jsを使用して、単一のmonorepoからGitHub Actions、Azure Pipelines、CircleCI用のCI拡張機能を開発、テスト、デプロイする方法を説明します。
> monorepoの作成、アクションとタスク間でのコード共有、拡張機能のビルドと公開について説明します。
> #### 目次
><!-- TOC -->
>* [公式テンプレートから始める](#公式テンプレートから始める)
>    * [JSベースのアクションを使用する利点:](#jsベースのアクションを使用する利点)
>    * [欠点](#欠点)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [monorepoを作成する](#monorepoを作成する)
>* [アクションとタスク間でコードを共有する](#アクションとタスク間でコードを共有する)
>* [ビルドと公開](#ビルドと公開)
>* [CircleCI?](#circleci)
><!-- TOC -->

これは、単一のmonorepoからGitHub Actions、Azure Pipelines、CircleCI用のCI拡張機能を開発、テスト、デプロイする方法についての比較的短いチュートリアルで、[Qodana CI拡張機能](https://github.com/JetBrains/qodana-action)の作成経験に基づいています。

## 公式テンプレートから始める

CI拡張機能の技術スタックを選択しましょう。

OK、選択しません。拡張機能にTypeScriptとnode.jsを使用した理由を説明します。

#### JSベースのアクションを使用する利点
- bash/Dockerfileベースのアプローチよりも柔軟
  - より多くのライブラリ（[actions/toolkit](https://github.com/actions/toolkit)や[microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)など）が、よりアクセスしやすく使いやすいAPIを提供
- テストの作成が比較的簡単

#### 欠点
- JavaScript

では、TypeScriptベースのアクションを書きましょう！


### GitHub Actions

GitHub actionsのドキュメントはAzureよりも読みやすいと思いますので、公式テンプレート[actions/typescript-action](https://github.com/actions/typescript-action)を使用して、GitHub上で拡張機能の作成とテストを開始することをお勧めします。前述のテンプレートは良い出発点を提供します。ここでは手順を繰り返しません。使ってみて、簡単なものを書いて、次のステップのためにここに戻ってきてください。

### Azure Pipelines

GitHub ActionsはAzureインフラストラクチャ上に構築されているため、GitHub actionをAzure Pipelinesに移植することは比較的簡単です。

つまり、
- "action"が"task"になる
- パッケージ化、配布、インストールの方法が少し異なる

そして、タスクの定義`task.json`はアクションの定義`action.yml`と同じです。

例えば、次の`action.yml`があるとします：

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

これは次のAzureタスクに「簡単に」変換されます：

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

このような簡単な例から、GitHub Actionsから始めることを提案した理由がわかります。しかし、続けましょう。

新しいAzure Pipelinesタスクの開発を始めるには、actionディレクトリをコピーしてから、[公式Azureドキュメント](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops)の手順を実装することをお勧めします。非常に簡単です。
1. `vss-extension.json`を作成
2. `task.json`を作成し、`dist`ディレクトリに配置（実際にはタスク名にちなんで命名する方が良い）
3. actionで`@actions/core`または`@actions/github`のメソッドを使用した場合、`azure-pipelines-task-lib`の対応するメソッドに置き換える必要があります（例：`core.getInput` -> `tl.getInput`）

`azure-pipelines-task-lib`のAPIは、`@actions/core`や他の`@actions/*`ライブラリに似ています。
例えば、入力パラメータを取得するメソッドがあります：

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Azure Pipelinesでも同じです：

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

より実際的なケースについては、Qodana GitHub Actionsのコードベース[utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts)とAzure Pipelinesタスクの[utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts)を自由に調べてください。


## monorepoを作成する

monorepoを管理するために[npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)を使用します。
新しく作成したmonorepoのサブディレクトリ（例：`github`）にactionとtaskのコードを配置します。次に、ルートディレクトリに`package.json`ファイルを作成します。

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

monorepo構造は次のようになります：

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

workspaceの設定を実装した後、ルートディレクトリからタスクとアクションを実行できます。例えば、`github`ディレクトリから`build`タスクを実行するには、次のコマンドを使用できます：

```bash
npm run -w github build
```

## アクションとタスク間でコードを共有する

monorepoアプローチを使用することの最も価値のある部分はここから始まります：アクションとタスク間でコードを共有できます。

次の手順を実行します：
1. monorepoのルートに`common`ディレクトリを作成し、共有コードのサブプロジェクトにする
2. すべてのサブディレクトリから`tsconfig.json`コンパイラ設定を更新して、適切なプロジェクトビルドを行う

まず、すべてのサブプロジェクトで使用される基本設定を含む基本`tsconfig` - `tsconfig.base.json`を作成しましょう：
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
次に、プロジェクトルートに簡単な`tsconfig.json`を作成します：

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

次に`common/tsconfig.json`：

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

最後に、サブプロジェクトの`tsconfig.json`ファイルを更新します（基本的にすべて同じです。例：`github/tsconfig.json`）：

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

これで、アクションとタスクで`common`ディレクトリから共有コードを使用できます。例えば、`common`ディレクトリに`qodana.ts`ファイルがあり、Qodana CLIツールへのURLを返す関数[`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21)が含まれています。そして、アクションとタスクの両方で[それを使用](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code)しています。

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## ビルドと公開

テンプレートから構成されたGitHub workflowsは、アクションをリポジトリリリースに公開するように既に設定されています。
自動リリースには、GH CLIを使用しており、リポジトリリリースに変更履歴を公開する簡単なスクリプトがあります：

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

そして、それを実行するGitHub workflow：

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

Azure Pipelinesタスクのリリースには、Azureの公式アプローチを使用できますが、GitHub actionsインフラストラクチャでも同じことができます。パブリッシャーツールはどこにでもインストールできるからです。したがって、私たちの場合は、簡単なGitHub workflowジョブで解決されます：

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

この設定により、各タグプッシュ時に自動的にリリースが行われます。

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

ああ、そうです、この記事ではCircleCI orbについても言及しました... CircleCIの設定は簡単ですが、TypeScript拡張機能をサポートしていないため、コードをDockerイメージまたはバイナリにパックして実行する必要があります。この投稿に含まれている唯一の理由は、monorepoアプローチでorbをビルドしており、それがうまく機能しているためです。

[公式orbテンプレート](https://circleci.com/docs/2.0/orb-author/#quick-start)を実装し、monorepoに配置します。構造は次のようになります：

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

また、CircleCIがorbをリント、テスト、公開できるように、`.circleci/`ディレクトリをリポジトリにコミットすることを忘れないでください。

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
