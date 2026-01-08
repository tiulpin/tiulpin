---
date: 2023-11-25
title: Wie viele Ziffern reichen aus, um einen Git-Commit zu referenzieren?
translationKey: notes/git-collision
tags:
    - git
    - collision
    - education
---

> Siehe auch: [[courses/missing_semester/2024-10-05-3|Git Lucky]] Vorlesung aus dem Missing Semester Kurs für Git-Grundlagen.

Hängt von der Gesamtanzahl der Commits ab. Die Wahrscheinlichkeit $$p$$ kann approximiert werden als

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ ist die Anzahl der Elemente
- $$m$$ ist die Anzahl der Möglichkeiten für jedes Element

Die Anzahl der Möglichkeiten für einen Hex-String ist $$( 16^c )$$

- wobei $$( c )$$ die Anzahl der Zeichen ist.

Also für `8` Zeichen und `30K` Commits (angenommen `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Erhöht man es auf 12 Zeichen:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
