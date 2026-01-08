---
date: 2025-12-14
title: AI Tips
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Hier verzamel ik AI-coderingstips die ik nuttig vind, gebaseerd op mijn ervaring en [deze HN-discussie](https://news.ycombinator.com/item?id=46255285). De belangrijkste: [[nl/notes/write-the-damn-code|schrijf de verdoemde code]]. Word geen prompt-verfijner.

## Gebruik projectregels

Zet dingen die het model herhaaldelijk fout doet in `CLAUDE.md`. Documenteer codeerstijlen, domeintermen, hoe tests uit te voeren. Update het wanneer het model je twee keer op dezelfde manier irriteert.

## Plan voordat je codeert

Gebruik de planmodus. Voor grote taken, laat het model een specificatie genereren, dan architectuurdocumenten, dan TODO-lijsten. Pas dan laat je het kleine, goed afgebakende taken implementeren.

## Geef het manieren om zichzelf te controleren

Geef testcommando's. Laat het tests in een loop uitvoeren totdat ze slagen. Voor UI, voeg browsertools toe zodat het de daadwerkelijk gerenderde pagina kan zien.

## Behandel het als een nieuwe ontwikkelaar

Breek werk op in kleine taken. Geef technische beschrijvingen plus relevante bestanden. Laat het plannen en vragen stellen. Jij blijft gefocust op architectuur; het doet het loodgieterswerk.

## Begin met een referentie

Codeer één instantie goed met de hand. Commit het. Vertel het model dat patroon te volgen voor de rest.

## Gebruik het waar het uitblinkt

AI is geweldig voor: repetitieve vergelijkbare veranderingen, JSON-manipulatie, tests genereren voor bestaande code. Het is slechter voor het ontwerpen van systemen vanaf nul met vage vereisten.

## Reset vaak

Gebruik geen eindeloze chats. Eén gesprek per taak. Instructies stoppen met het beïnvloeden van de output na veel beurten. Begin vaak opnieuw.

## Wees expliciet

Zeg nooit alleen "bouw functie X" en ga weg. Leg de gewenste eindstaat uit. Laat het model de vereisten herhalen. Bekijk elke diff.

## Denk aan specifieke tools, niet "AI"

Vraag: heb ik betere autocompletie nodig? Eenmalige codevoorbeelden? Standaardcode? Gebruik LLM's waar je het domein goed genoeg begrijpt om resultaten te verifiëren.
