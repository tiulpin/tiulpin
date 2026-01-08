---
date: 2023-11-25
title: ¿Cuántos dígitos son suficientes para referenciar un commit de Git?
tags:
    - git
    - collision
    - education
translationKey: notes/git-collision
---

> Ver también: [[courses/missing_semester/2024-10-05-3|Git Lucky]] conferencia del curso Missing Semester sobre fundamentos de Git.

Depende del número total de commits. La probabilidad $$p$$ puede aproximarse como

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ es el número de elementos
- $$m$$ es el número de posibilidades para cada elemento

El número de posibilidades para una cadena hexadecimal es $$( 16^c )$$

- donde $$( c )$$ es el número de caracteres.

Entonces, para `8` caracteres y `30K` commits (asumiendo `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Aumentándolo a 12 caracteres:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
