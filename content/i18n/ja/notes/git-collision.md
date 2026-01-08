---
date: 2023-11-25
title: Gitコミットを参照するには何桁で十分か？
tags:
    - git
    - collision
    - education
translationKey: notes/git-collision
---

> 参照：Gitの基礎については[[courses/missing_semester/2024-10-05-3|Git Lucky]]講義（Missing Semesterコースより）も参照してください。

コミットの総数に依存します。確率$$p$$は次のように近似できます

$$
p \approx \frac{n^2}{2m}
$$

- $$n$$はアイテムの数
- $$m$$は各アイテムの可能性の数

16進数文字列の可能性の数は$$( 16^c )$$です

- ここで$$( c )$$は文字数です。

したがって、`8`文字と`30K`コミット（`30K`≈$$( 2^{15} )$$と仮定）の場合：

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^8} = \frac{2^{30}}{2^{33}} = 2^{-3}
$$

12文字に増やすと：

$$
p \approx \frac{n^2}{2m} \approx \frac{(2^{15})^2}{2 \times 16^{12}} = \frac{2^{30}}{2^{49}} = 2^{-19}
$$
