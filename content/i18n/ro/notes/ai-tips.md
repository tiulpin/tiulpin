---
date: 2025-12-14
title: Sfaturi AI
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Aici colectez sfaturi de programare cu AI pe care le găsesc utile, bazate pe experiența mea și pe [această discuție HN](https://news.ycombinator.com/item?id=46255285). Cel mai important: [[notes/write-the-damn-code|scrie naibii codul]]. Nu deveni un rafinor de prompturi.

## Folosește reguli de proiect

Pune în `CLAUDE.md` lucrurile pe care modelul le greșește în mod repetat. Documentează convențiile de programare, termenii din domeniu, cum să rulezi testele. Actualizează-l ori de câte ori modelul te enervează în același fel de două ori.

## Planifică înainte de a programa

Folosește modul de planificare. Pentru sarcini mari, fă modelul să genereze o specificație, apoi documente de arhitectură, apoi liste TODO. Abia apoi lasă-l să implementeze sarcini mici și bine delimitate.

## Oferă-i modalități de auto-verificare

Furnizează comenzi de testare. Lasă-l să ruleze teste într-o buclă până când trec. Pentru UI, atașează instrumente de browser astfel încât să poată vedea pagina randată efectiv.

## Tratează-l ca pe un dezvoltator nou

Împarte munca în sarcini mici. Oferă descrieri tehnice plus fișierele relevante. Lasă-l să planifice și să pună întrebări. Tu rămâi concentrat pe arhitectură; el face instalațiile.

## Pornește de la o referință

Programează manual o instanță bine. Fă commit. Spune modelului să urmeze acel model pentru restul.

## Folosește-l unde excelează

AI este grozav pentru: schimbări similare repetitive, manipularea JSON, generarea de teste pentru cod existent. Este mai slab pentru proiectarea sistemelor de la zero cu cerințe vagi.

## Resetează des

Nu folosi conversații nesfârșite. O conversație per sarcină. Instrucțiunile încetează să influențeze rezultatul după multe ture. Începe proaspăt frecvent.

## Fii explicit

Nu spune niciodată doar "construiește funcționalitatea X" și pleacă. Explică starea finală dorită. Fă modelul să repete cerințele. Revizuiește fiecare diff.

## Gândește la instrumente specifice, nu la "AI"

Întreabă: am nevoie de autocomplete mai bun? Exemple de cod ocazionale? Boilerplate? Folosește LLM-uri acolo unde înțelegi destul de bine domeniul pentru a verifica rezultatele.
