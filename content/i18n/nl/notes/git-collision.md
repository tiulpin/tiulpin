---
date: 2023-11-25
title: Hoeveel cijfers zijn genoeg om naar een Git-commit te verwijzen?
translationKey: notes/git-collision
tags:
    - git
    - collision
    - education
---

> Zie ook: [[courses/missing_semester/2024-10-05-3|Git Lucky]] college uit de Missing Semester cursus voor Git-fundamentals.

Hangt af van het totale aantal commits. De waarschijnlijkheid $$p$$ kan benaderd worden als

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ is het aantal items
- $$m$$ is het aantal mogelijkheden voor elk item

Het aantal mogelijkheden voor een hex string is $$( 16^c )$$

- waarbij $$( c )$$ het aantal tekens is.

Dus voor `8` tekens en `30K` commits (uitgaande van `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Het verhogen naar 12 tekens:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
