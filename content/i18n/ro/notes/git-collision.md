---
date: 2023-11-25
title: Câte cifre sunt suficiente pentru a face referire la un commit Git?
tags:
    - git
    - collision
    - education
translationKey: notes/git-collision
---

> Vezi și: [[courses/missing_semester/2024-10-05-3|Git Lucky]] prelegerea din cursul Missing Semester pentru fundamentele Git.

Depinde de numărul total de commit-uri. Probabilitatea $$p$$ poate fi aproximată ca

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ este numărul de elemente
- $$m$$ este numărul de posibilități pentru fiecare element

Numărul de posibilități pentru un șir hexazecimal este $$( 16^c )$$

- unde $$( c )$$ este numărul de caractere.

Deci pentru `8` caractere și `30K` commit-uri (presupunând că `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Crescând la 12 caractere:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
