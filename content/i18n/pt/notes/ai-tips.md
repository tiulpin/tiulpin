---
date: 2025-12-14
title: Dicas de IA
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Aqui coleciono dicas de codificação com IA que considero úteis, baseadas na minha experiência e [nesta discussão do HN](https://news.ycombinator.com/item?id=46255285). A mais importante: [[notes/write-the-damn-code|escreva o maldito código]]. Não se torne um refinador de prompts.

## Use regras de projeto

Coloque no `CLAUDE.md` as coisas que o modelo erra repetidamente. Documente convenções de código, termos do domínio, como executar testes. Atualize sempre que o modelo te irritar da mesma forma duas vezes.

## Planeje antes de codificar

Use o modo de planejamento. Para tarefas grandes, faça o modelo gerar uma especificação, depois documentos de arquitetura, depois listas de TAREFAS. Só então deixe-o implementar tarefas pequenas e bem delimitadas.

## Dê a ele maneiras de se auto-verificar

Forneça comandos de teste. Deixe-o executar testes em loop até passarem. Para UI, anexe ferramentas de navegador para que ele possa ver a página renderizada real.

## Trate-o como um dev novo

Divida o trabalho em tarefas pequenas. Dê descrições técnicas mais arquivos relevantes. Deixe-o planejar e fazer perguntas. Você fica focado na arquitetura; ele faz o trabalho braçal.

## Comece de uma referência

Codifique manualmente uma instância bem feita. Faça commit. Diga ao modelo para seguir esse padrão para o resto.

## Use-o onde ele brilha

IA é ótima para: mudanças repetitivas similares, manipulação de JSON, geração de testes para código existente. É pior para projetar sistemas do zero com requisitos vagos.

## Reinicie com frequência

Não use conversas infinitas. Uma conversa por tarefa. As instruções param de influenciar a saída após muitas interações. Recomece frequentemente.

## Seja explícito

Nunca apenas diga "construa funcionalidade X" e vá embora. Explique o estado final desejado. Faça o modelo reafirmar os requisitos. Revise cada diff.

## Pense em ferramentas específicas, não "IA"

Pergunte: preciso de melhor autocompletar? Exemplos de código únicos? Boilerplate? Use LLMs onde você entende o domínio bem o suficiente para verificar os resultados.
