---
date: 2023-11-25
title: Quantos dígitos são suficientes para referenciar um commit Git?
tags:
    - git
    - collision
    - education
translationKey: notes/git-collision
---

> Veja também: [[courses/missing_semester/2024-10-05-3|Git Lucky]] palestra do curso Missing Semester sobre fundamentos do Git.

Depende do número total de commits. A probabilidade $$p$$ pode ser aproximada como

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ é o número de itens
- $$m$$ é o número de possibilidades para cada item

O número de possibilidades para uma string hexadecimal é $$( 16^c )$$

- onde $$( c )$$ é o número de caracteres.

Então para `8` caracteres e `30K` commits (assumindo `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Aumentando para 12 caracteres:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
