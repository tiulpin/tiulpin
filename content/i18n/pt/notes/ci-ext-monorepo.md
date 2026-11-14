---
date: 2023-06-18
title: Desenvolva, teste e implante suas extensões para todos os CIs populares a partir de uma única base de código
description: Ou como eu implementei isso para o Qodana
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
translationKey: notes/ci-ext-monorepo
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 A imagem de destaque mostra um pipeline típico de CI/CD em ação, parcialmente desenhado por OpenAI DALL-E, mas neste artigo vamos desenvolver algo benéfico

> [!info]- Conteúdo
> Este tutorial demonstra como desenvolver, testar
> e implantar extensões de CI para GitHub Actions, Azure Pipelines
> e CircleCI a partir de um único monorepo usando TypeScript e Node.js.
> Abrange a criação de um monorepo, o compartilhamento de código entre actions e tasks, e a construção e publicação de extensões.
> #### Índice
><!-- TOC -->
>* [Comece com os templates oficiais](#comece-com-os-templates-oficiais)
>    * [Vantagens de usar actions baseadas em JS:](#vantagens-de-usar-actions-baseadas-em-js)
>    * [Desvantagens](#desvantagens)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Crie o monorepo](#crie-o-monorepo)
>* [Compartilhe código entre actions e tasks](#compartilhe-código-entre-actions-e-tasks)
>* [Construa e publique](#construa-e-publique)
>* [CircleCI?](#circleci)
><!-- TOC -->

Este é um tutorial relativamente curto sobre como desenvolver, testar e implantar suas extensões de CI para GitHub Actions, Azure Pipelines e CircleCI a partir de um único monorepo e é baseado na experiência de criar as [extensões de CI do Qodana](https://github.com/JetBrains/qodana-action).

## Comece com os templates oficiais

Vamos escolher a pilha de tecnologia para nossas extensões de CI.

OK, eu não vou escolher. Vou apenas dizer por que usei TypeScript e node.js para as extensões.

#### Vantagens de usar actions baseadas em JS
- Mais flexível do que abordagens baseadas em bash/Dockerfile
  - Diferentes bibliotecas (como [actions/toolkit](https://github.com/actions/toolkit) e [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) com APIs mais acessíveis e fáceis de usar estão disponíveis por padrão
- Escrever testes é relativamente simples

#### Desvantagens
- JavaScript

Então vamos escrever uma action baseada em TypeScript!


### GitHub Actions

Achei a documentação do GitHub Actions mais fácil de ler do que a do Azure, então recomendo começar escrevendo e testando suas extensões no GitHub usando o template oficial [actions/typescript-action](https://github.com/actions/typescript-action). O template mencionado fornece um bom ponto de partida; não vou repetir os passos aqui. Brinque com ele, escreva algumas coisas simples e depois volte aqui para os próximos passos.

### Azure Pipelines

O GitHub Actions é construído sobre a infraestrutura do Azure, então portar sua GitHub action para o Azure Pipelines deve ser relativamente fácil.

Então,
- a "action" torna-se a "task"
- é empacotada de forma um pouco diferente, distribuída e instalada de outra maneira

E a definição de uma task `task.json` é a mesma que a de uma action `action.yml`.

Por exemplo, tendo o seguinte `action.yml`:

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

"Facilmente" se traduz para a seguinte task do Azure:

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

A partir de um exemplo tão simples, pode-se ver por que sugeri começar com GitHub Actions. Mas vamos continuar.

Para começar a desenvolver sua nova task brilhante do Azure Pipelines, sugiro apenas copiar o diretório da action e então implementar os passos da [documentação oficial do Azure](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – é bem direto.
1. Crie `vss-extension.json`
2. Crie `task.json` e coloque-o no diretório `dist` (na verdade é melhor nomeá-lo após o nome da task)
3. Se você usou algum método de `@actions/core` ou `@actions/github` em sua action, você precisa substituí-los pelos métodos correspondentes de `azure-pipelines-task-lib` (por exemplo, `core.getInput` -> `tl.getInput`)

A API de `azure-pipelines-task-lib` é similar a `@actions/core` e outras bibliotecas `@actions/*`.
Por exemplo, temos um método para obter os parâmetros de entrada:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

E o mesmo para Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Para casos mais reais, sinta-se à vontade para explorar nossa base de código do Qodana GitHub Actions [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) e Azure Pipelines task [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts).


## Crie o monorepo

Vamos usar [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) para gerenciar o monorepo.
Coloque seu código de action e task em subdiretórios (por exemplo, `github`) do seu monorepo recém-criado. E então crie um arquivo `package.json` no diretório raiz.

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

Então a estrutura do monorepo fica assim:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Após implementar a configuração do workspace, você pode executar tasks e actions do diretório raiz. Por exemplo, para executar a task `build` do diretório `github`, você pode usar o seguinte comando:

```bash
npm run -w github build
```

## Compartilhe código entre actions e tasks

A parte mais valiosa do uso da abordagem de monorepo começa aqui: você pode compartilhar o código entre suas actions e tasks.

Vamos fazer os seguintes passos:
1. Criar um diretório `common` na raiz do monorepo, um subprojeto para código compartilhado
2. Atualizar as configurações do compilador `tsconfig.json` de todos os subdiretórios para builds adequados do projeto

Primeiro, vamos criar o `tsconfig` base – `tsconfig.base.json` com as configurações base que serão usadas em todos os subprojetos:
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
Então crie um `tsconfig.json` simples na raiz do projeto:

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

Então `common/tsconfig.json`:

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

E finalmente, atualize os arquivos `tsconfig.json` nos subprojetos (eles são basicamente os mesmos, por exemplo, `github/tsconfig.json`):

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

Agora você pode usar o código compartilhado do diretório `common` em suas actions e tasks. Por exemplo, temos um arquivo `qodana.ts` no diretório `common` que contém a função [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) que retorna a URL para a ferramenta CLI do Qodana. E nós [a usamos](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) tanto em actions quanto em tasks.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Construa e publique

Você já tem workflows do GitHub do template configurados para publicar suas actions nos releases do seu repositório.
Para releases automatizados, usamos GH CLI, e temos um script simples que publica um changelog nos releases do repositório:

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

E o workflow do GitHub que o executa:

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

Para releases de tasks do Azure Pipelines, você pode usar a abordagem oficial do Azure. Mas também pode fazer o mesmo na infraestrutura do GitHub Actions, já que a ferramenta de publicação deles pode ser instalada em qualquer lugar. Então, no nosso caso, é resolvido por um simples job de workflow do GitHub:

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

Com essa configuração, cada release acontece automaticamente em cada push de tag.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## CircleCI?

Ah, sim, este artigo mencionou o orb do CircleCI também... A configuração do CircleCI é direta, mas não suporta extensões TypeScript, então você precisa empacotar seu código em uma imagem Docker ou um binário e executá-lo lá. A única razão para estar incluído neste post é que construímos nosso orb com a abordagem de monorepo, que funciona bem.

Implemente [o template oficial de orb](https://circleci.com/docs/orbs/author/creating-orbs/)
e coloque-o em seu monorepo,
então a estrutura fica assim:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # código-fonte do orb aqui
└── package.json
```

E lembre-se de fazer commit do diretório `.circleci/` no seu repositório para fazer o CircleCI lint, testar e publicar seu orb.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
