---
date: 2025-12-14
title: KI-Tipps
translationKey: notes/ai-tips
tags:
    - tips
    - programming
    - engineering
    - ai
---

Hier sammle ich KI-Programmier-Tipps, die ich aufgrund meiner Erfahrung und [dieser HN-Diskussion](https://news.ycombinator.com/item?id=46255285) als nützlich empfinde. Der wichtigste: [[de/notes/write-the-damn-code|Schreib den verdammten Code]]. Werde kein Prompt-Verfeinerer.

## Verwende Projektregeln

Schreibe Dinge, die das Modell wiederholt falsch macht, in `CLAUDE.md`. Dokumentiere Programmierkonventionen, Fachbegriffe, wie Tests ausgeführt werden. Aktualisiere es, wann immer dich das Modell zum zweiten Mal auf die gleiche Weise nervt.

## Plane vor dem Programmieren

Verwende den Planungsmodus. Für große Aufgaben, lass das Modell eine Spezifikation generieren, dann Architekturdokumente, dann TODO-Listen. Erst dann lass es kleine, gut abgegrenzte Aufgaben implementieren.

## Gib ihm Möglichkeiten zur Selbstüberprüfung

Stelle Testbefehle bereit. Lass es Tests in einer Schleife ausführen, bis sie bestehen. Für UI, füge Browser-Tools hinzu, damit es die tatsächlich gerenderte Seite sehen kann.

## Behandle es wie einen neuen Entwickler

Teile die Arbeit in kleine Aufgaben auf. Gib technische Beschreibungen plus relevante Dateien. Lass es planen und Fragen stellen. Du bleibst auf die Architektur fokussiert; es macht die Klempnerarbeit.

## Starte von einer Referenz aus

Programmiere eine Instanz gut von Hand. Committe sie. Sage dem Modell, dass es diesem Muster für den Rest folgen soll.

## Verwende es dort, wo es glänzt

KI ist großartig für: sich wiederholende ähnliche Änderungen, JSON-Verarbeitung, Generierung von Tests für bestehenden Code. Es ist schlechter darin, Systeme von Grund auf mit vagen Anforderungen zu entwerfen.

## Setze oft zurück

Verwende keine endlosen Chats. Eine Konversation pro Aufgabe. Anweisungen hören nach vielen Durchgängen auf, die Ausgabe zu beeinflussen. Starte häufig frisch.

## Sei explizit

Sage niemals nur "baue Feature X" und gehe. Erkläre den gewünschten Endzustand. Lass das Modell die Anforderungen wiederholen. Überprüfe jedes Diff.

## Denke an spezifische Werkzeuge, nicht "KI"

Frage: Brauche ich bessere Autovervollständigung? Einmalige Codebeispiele? Boilerplate? Verwende LLMs dort, wo du die Domäne gut genug verstehst, um Ergebnisse zu überprüfen.
