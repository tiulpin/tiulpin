---
date: 2025-12-14
title: Consejos de IA
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Aquí recopilo consejos de codificación con IA que encuentro útiles, basados en mi experiencia y [esta discusión de HN](https://news.ycombinator.com/item?id=46255285). El más importante: [[es/notes/write-the-damn-code|escribe el maldito código]]. No te conviertas en un refinador de prompts.

## Usa reglas de proyecto

Pon en `CLAUDE.md` las cosas que el modelo se equivoca repetidamente. Documenta convenciones de código, términos del dominio, cómo ejecutar pruebas. Actualízalo cada vez que el modelo te moleste de la misma manera dos veces.

## Planifica antes de codificar

Usa el modo de planificación. Para tareas grandes, haz que el modelo genere una especificación, luego documentos de arquitectura, luego listas de TODO. Solo entonces déjalo implementar tareas pequeñas y bien definidas.

## Dale formas de verificarse

Proporciona comandos de prueba. Déjalo ejecutar pruebas en un bucle hasta que pasen. Para UI, adjunta herramientas de navegador para que pueda ver la página renderizada real.

## Trátalo como un desarrollador nuevo

Divide el trabajo en tareas pequeñas. Da descripciones técnicas más archivos relevantes. Déjalo planificar y hacer preguntas. Tú te enfocas en la arquitectura; él hace la fontanería.

## Comienza desde una referencia

Codifica bien una instancia a mano. Haz commit. Dile al modelo que siga ese patrón para el resto.

## Úsalo donde brilla

La IA es excelente para: cambios repetitivos similares, manejo de JSON, generar pruebas para código existente. Es peor para diseñar sistemas desde cero con requisitos vagos.

## Reinicia a menudo

No uses chats interminables. Una conversación por tarea. Las instrucciones dejan de influir en la salida después de muchos turnos. Comienza fresco frecuentemente.

## Sé explícito

Nunca solo digas "construye la función X" y te vayas. Explica el estado final deseado. Haz que el modelo reafirme los requisitos. Revisa cada diff.

## Piensa en herramientas específicas, no en "IA"

Pregúntate: ¿necesito mejor autocompletado? ¿Ejemplos de código únicos? ¿Código repetitivo? Usa LLMs donde entiendas el dominio lo suficientemente bien para verificar los resultados.
