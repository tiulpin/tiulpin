---
date: 2025-12-14
title: Conseils sur l'IA
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Ici je collecte les conseils de codage avec l'IA que je trouve utiles, basés sur mon expérience et [cette discussion HN](https://news.ycombinator.com/item?id=46255285). Le plus important : [[fr/notes/write-the-damn-code|écrivez le code vous-même]]. Ne devenez pas un affineur de prompts.

## Utilisez les règles de projet

Mettez dans `CLAUDE.md` ce que le modèle se trompe régulièrement. Documentez les conventions de codage, les termes du domaine, comment exécuter les tests. Mettez-le à jour chaque fois que le modèle vous agace de la même manière deux fois.

## Planifiez avant de coder

Utilisez le mode planification. Pour les grandes tâches, faites générer une spécification au modèle, puis des documents d'architecture, puis des listes de TODO. Seulement après, laissez-le implémenter de petites tâches bien définies.

## Donnez-lui des moyens de s'auto-vérifier

Fournissez des commandes de test. Laissez-le exécuter les tests en boucle jusqu'à ce qu'ils passent. Pour l'UI, attachez des outils de navigateur pour qu'il puisse voir la page réellement rendue.

## Traitez-le comme un nouveau développeur

Divisez le travail en petites tâches. Donnez des descriptions techniques plus les fichiers pertinents. Laissez-le planifier et poser des questions. Vous restez concentré sur l'architecture ; il fait la plomberie.

## Partez d'une référence

Codez bien une instance à la main. Commitez-la. Dites au modèle de suivre ce modèle pour le reste.

## Utilisez-le là où il brille

L'IA est excellente pour : les changements répétitifs similaires, la manipulation de JSON, la génération de tests pour du code existant. Elle est moins bonne pour concevoir des systèmes from scratch avec des exigences vagues.

## Réinitialisez souvent

N'utilisez pas de discussions interminables. Une conversation par tâche. Les instructions cessent d'influencer la sortie après de nombreux tours. Recommencez fréquemment à zéro.

## Soyez explicite

Ne dites jamais simplement "construis la fonctionnalité X" et partez. Expliquez l'état final souhaité. Faites reformuler les exigences au modèle. Examinez chaque diff.

## Pensez outils spécifiques, pas "IA"

Demandez-vous : ai-je besoin d'une meilleure autocomplétion ? D'exemples de code ponctuels ? De code passe-partout ? Utilisez les LLM là où vous comprenez suffisamment bien le domaine pour vérifier les résultats.
