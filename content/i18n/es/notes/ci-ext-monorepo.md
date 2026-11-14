---
date: 2023-06-18
title: Desarrolla, prueba y despliega tus extensiones para todos los CIs populares desde una única base de código
description: O cómo lo implementé para Qodana
tags:
  - github-actions
  - circleci
  - azure
  - education
  - crosspost
translationKey: notes/ci-ext-monorepo
---

![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9vcmavef9imakkjzq1gm.png)

> 💡 La imagen destacada muestra un pipeline típico de CI/CD en acción, parcialmente dibujado por OpenAI DALL-E, pero en este artículo vamos a desarrollar algo beneficioso

> [!info]- Contenidos
> Este tutorial demuestra cómo desarrollar, probar y desplegar extensiones de CI
> para GitHub Actions, Azure Pipelines y CircleCI desde un único monorepo
> utilizando TypeScript y Node.js.
> Cubre la creación de un monorepo, compartir código entre acciones y tareas, y construir y publicar extensiones.
> #### Tabla de Contenidos
><!-- TOC -->
>* [Comienza con las plantillas oficiales](#comienza-con-las-plantillas-oficiales)
>    * [Ventajas de usar acciones basadas en JS](#ventajas-de-usar-acciones-basadas-en-js)
>    * [Desventajas](#desventajas)
>    * [GitHub Actions](#github-actions)
>    * [Azure Pipelines](#azure-pipelines)
>* [Crea el monorepo](#crea-el-monorepo)
>* [Comparte código entre acciones y tareas](#comparte-código-entre-acciones-y-tareas)
>* [Construye y publica](#construye-y-publica)
>* [¿CircleCI?](#circleci)
><!-- TOC -->

Este es un tutorial relativamente corto sobre cómo desarrollar, probar y desplegar tus extensiones de CI para GitHub Actions, Azure Pipelines y CircleCI desde un único monorepo y está basado en la experiencia de crear las [extensiones de CI de Qodana](https://github.com/JetBrains/qodana-action).

## Comienza con las plantillas oficiales

Elijamos la pila de tecnologías para nuestras extensiones de CI.

OK, no voy a elegir. Solo te diré por qué usé TypeScript y node.js para las extensiones.

#### Ventajas de usar acciones basadas en JS
- Más flexible que los enfoques basados en bash/Dockerfile
  - Diferentes bibliotecas (como [actions/toolkit](https://github.com/actions/toolkit) y [microsoft/azure-pipelines-task-lib](https://github.com/microsoft/azure-pipelines-task-lib)) con APIs más accesibles y fáciles de usar están disponibles de forma inmediata
- Escribir pruebas es relativamente simple

#### Desventajas
- JavaScript

¡Así que escribamos una acción basada en TypeScript!


### GitHub Actions

Encontré la documentación de GitHub Actions más fácil de leer que la de Azure, así que recomendaría comenzar escribiendo y probando tus extensiones en GitHub usando la plantilla oficial [actions/typescript-action](https://github.com/actions/typescript-action). La plantilla mencionada proporciona un buen punto de partida; no voy a repetir los pasos aquí. Juega con ella, escribe algo sencillo y luego regresa aquí para los siguientes pasos.

### Azure Pipelines

GitHub Actions está construido sobre infraestructura de Azure, por lo que portar tu acción de GitHub a Azure Pipelines debería ser relativamente fácil.

Entonces,
- la "action" se convierte en la "task"
- se empaqueta de forma un poco diferente, se distribuye y se instala de otra manera

Y la definición de una tarea `task.json` es la misma que la de una acción `action.yml`.

Por ejemplo, teniendo el siguiente `action.yml`:

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

"Fácilmente" se traduce a la siguiente tarea de Azure:

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

De un ejemplo tan simple, se puede ver por qué sugerí empezar con GitHub Actions. Pero continuemos.

Para comenzar a desarrollar tu nueva y brillante tarea de Azure Pipelines, sugiero simplemente copiar el directorio de la acción y luego implementar los pasos de [la documentación oficial de Azure](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) – es bastante sencillo.
1. Crear `vss-extension.json`
2. Crear `task.json` y colocarlo en tu directorio `dist` (de hecho, es mejor nombrarlo según el nombre de la tarea)
3. Si usaste algún método de `@actions/core` o `@actions/github` en tu acción, necesitas reemplazarlos con los métodos correspondientes de `azure-pipelines-task-lib` (ej. `core.getInput` -> `tl.getInput`)

La API de `azure-pipelines-task-lib` es similar a `@actions/core` y otras bibliotecas `@actions/*`.
Por ejemplo, tenemos un método para obtener los parámetros de entrada:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: core.getInput('milliseconds'),
  }
}
```

Y lo mismo para Azure Pipelines:

```typescript
export function getInputs(): Inputs {
  return {
    milliseconds: tl.getInput('milliseconds'),
  }
}
```

Para casos más reales, siéntete libre de explorar nuestra base de código de GitHub Actions de Qodana [utils](https://github.com/JetBrains/qodana-action/blob/main/scan/src/utils.ts) y los [utils](https://github.com/JetBrains/qodana-action/blob/main/vsts/src/utils.ts) de la tarea de Azure Pipelines.


## Crea el monorepo

Vamos a usar [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) para gestionar el monorepo.
Coloca tu código de acción y tarea en subdirectorios (ej. `github`) de tu monorepo recién creado. Y luego crea un archivo `package.json` en el directorio raíz.

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

Así que la estructura del monorepo se ve así:

```text
...
├── action.yaml
├── github/
├── azure/
└── package.json
```

Después de implementar la configuración del workspace, puedes ejecutar tareas y acciones desde el directorio raíz. Por ejemplo, para ejecutar la tarea `build` desde el directorio `github`, puedes usar el siguiente comando:

```bash
npm run -w github build
```

## Comparte código entre acciones y tareas

La parte más valiosa del uso del enfoque de monorepo comienza aquí: puedes compartir el código entre tus acciones y tareas.

Vamos a realizar los siguientes pasos:
1. Crear un directorio `common` en la raíz del monorepo, un subproyecto para código compartido
2. Actualizar las configuraciones del compilador `tsconfig.json` de todos los subdirectorios para construcciones de proyectos adecuadas

Primero, creemos el `tsconfig` base – `tsconfig.base.json` con la configuración base que se usará en todos los subproyectos:
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
Luego crea un simple `tsconfig.json` en la raíz del proyecto:

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

Luego `common/tsconfig.json`:

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

Y finalmente, actualiza los archivos `tsconfig.json` en los subproyectos (son básicamente iguales, ej. `github/tsconfig.json`):

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

Ahora puedes usar el código compartido del directorio `common` en tus acciones y tareas. Por ejemplo, tenemos un archivo `qodana.ts` en el directorio `common` que contiene la función [`getQodanaUrl`](https://github.com/JetBrains/qodana-action/blob/main/common/qodana.ts#LL54C21-L54C21) que devuelve la URL a la herramienta CLI de Qodana. Y la [usamos](https://github.com/search?q=repo%3AJetBrains/qodana-action%20getQodanaUrl&type=code) tanto en acciones como en tareas.

<img width="1086" alt="CleanShot 2023-06-18 at 16 54 11@2x" src="https://user-images.githubusercontent.com/13538286/246672580-f8345026-7f7d-47ff-ad66-7da5355475c6.png">

## Construye y publica

Ya tienes workflows de GitHub de la plantilla configurados para publicar tus acciones en los releases de tu repositorio.
Para releases automatizados, usamos GH CLI, y tenemos un script simple que publica un changelog en los releases del repositorio:

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

Y el workflow de GitHub que lo ejecuta:

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

Para los releases de tareas de Azure Pipelines, puedes usar el enfoque oficial de Azure. Aun así, también puedes hacer lo mismo en la infraestructura de GitHub Actions ya que su herramienta de publicación se puede instalar en cualquier lugar. Entonces, en nuestro caso, se resuelve con un simple trabajo de workflow de GitHub:

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

Con esta configuración, cada release ocurre automáticamente en cada push de tag.

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
```

<img width="1241" alt="CleanShot 2023-06-18 at 16 55 34@2x" src="https://user-images.githubusercontent.com/13538286/246672668-93db2c5d-5617-400e-be2c-efaeb8652427.png">


## ¿CircleCI?

Ah, sí, este artículo también mencionó el orb de CircleCI... La configuración de CircleCI es sencilla pero no admite extensiones de TypeScript, así que tienes que empaquetar tu código en una imagen de Docker o un binario y ejecutarlo allí. La única razón por la que está incluido en este post es que construimos nuestro orb con el enfoque de monorepo, que funciona bien.

Implementa [la plantilla oficial de orb](https://circleci.com/docs/orbs/author/creating-orbs/)
y colócala en tu monorepo,
así que la estructura se ve así:

```text
...
├── action.yaml
├── github/
├── azure/
├── src/            # orb source code here
└── package.json
```

Y recuerda hacer commit del directorio `.circleci/` en tu repositorio para que CircleCI haga lint, pruebe y publique tu orb.

<img width="926" alt="CleanShot 2023-06-18 at 16 49 57@2x" src="https://user-images.githubusercontent.com/13538286/246672378-e7107578-9b52-46b3-8c42-3b381f007c93.png">
