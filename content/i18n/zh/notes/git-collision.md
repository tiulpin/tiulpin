---
date: 2023-11-25
title: 引用Git提交需要多少位数字?
translationKey: notes/git-collision
tags:
    - git
    - collision
    - education
---

> 另见: [[courses/missing_semester/2024-10-05-3|Git Lucky]] 讲座,来自 Missing Semester 课程的 Git 基础。

取决于提交的总数。概率 $$p$$ 可以近似为

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$ 是项目数量
- $$m$$ 是每个项目的可能性数量

十六进制字符串的可能性数量是 $$( 16^c )$$

- 其中 $$( c )$$ 是字符数量。

所以对于 `8` 个字符和 `30K` 次提交(假设 `30K` ≈ $$( 2^{15} )$$):

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

将其增加到 12 个字符:

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
