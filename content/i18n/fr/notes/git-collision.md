---
date: 2023-11-25
title: Combien de chiffres suffisent pour référencer un commit Git ?
tags:
    - git
    - collision
    - education
translationKey: notes/git-collision
---

> Voir également : [[courses/missing_semester/2024-10-05-3|Git Lucky]] - cours du Missing Semester sur les fondamentaux de Git.

Cela dépend du nombre total de commits. La probabilité $$p$$ peut être approximée comme

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ est le nombre d'éléments
- $$m$$ est le nombre de possibilités pour chaque élément

Le nombre de possibilités pour une chaîne hexadécimale est $$( 16^c )$$

- où $$( c )$$ est le nombre de caractères.

Donc pour `8` caractères et `30K` commits (en supposant `30K` ≈ $$( 2^{15} )$$) :

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

En augmentant à 12 caractères :

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
