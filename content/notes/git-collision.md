---
date: 2023-11-25
title: How many digits is enough to reference a Git commit?
tags:
    - git
    - cryptography
    - collision
---

Depends on the total number of commits. The probability $$p$$ can be approximated as

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ is the number of items
- $$m$$ is the number of possibilities for each item

The number of possibilities for a hex string is $$( 16^c )$$

- where $$( c )$$ is the number of characters.

So for `8` characters and `30K` commits (assuming `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

Increasing it to 12 characters:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$

