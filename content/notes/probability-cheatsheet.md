---
date: 2020-02-02
title: Probability Cheatsheet
tags:
  - math
---

> Why do you see it here? Because I need it.

## **Probability of an event**

Any subset $$E$$ of the sample space is known as **an event.**

That is, an event is a set consisting of possible outcomes of the experiment. If the outcome of the experiment is contained in , then we say that $$E$$ has occurred.

---

### **Axioms of probability**

For each event $$E$$, we denote $$\mathcal{P}(E)$$ as the probability of event $$E$$ occurring.

The probability that at least one of the elementary events in the sample space will occur is $$1$$.

Every probability value is between $$0$$ and $$1$$ included.

For any sequence of mutually exclusive events $$E_i$$ we have:

$$
\mathcal{P} \left( \bigcup_{i=1}^n E_i \right) = \sum_{i = 1}^n \mathcal{P} (E_i)
$$

---

### **Combinatorics**

**A permutation** is an arrangement of $$k$$ objects from a pool of $$n$$ objects, in a given order. The number of such arrangements is:

$$
P(n, k) = \frac{n!}{(n - k)!}
$$

**A combination** is an arrangement of  $$k$$ objects from a pool of $$n$$ objects, where the order does not matter. The number of such arrangements is:

$$
C(n, k) = \frac{n!}{k! \cdot (n - k)!}
$$

We note that for $$0 \le k \le n$$ *,* we have $$P(n, r) \ge C(n, r)$$

---

### **Conditional probabilities**

**Conditional probability** is the **probability** of one event occurring with some relationship to one or more other events.

**Independence.** Two events $$A$$ and $$B$$ are independent if and only if we have:

$$
P (A \cap B) = P(A) \cdot P(B)
$$

**Law of total probability.** Given an event $$A$$, with known conditional probabilities given any of the $$B_i$$ events, each with a known probability itself, what is the total probability that $$A$$ will happen? The answer is

$$
P(A) = \sum_{i = 1}^n P(A | B_i) \cdot P(B_i)
$$

**Bayes' rule.** For events $$A$$ and $$B$$ such that $$\mathcal{P}(B) > 0$$, we have

$$
P (A | B) = \frac{P(B | A) \cdot P(A)}{P(B)}
$$

---

## **Expectation and Moments of the Distribution**

The formulas will be explicitly detailed for the discrete **(D)** and continuous **(C)** cases.

**Expected value.** The expected value of a random variable, also known as the mean value or the first moment, is often noted $$\mathcal{E}[X]$$ and is the value that we would obtain by averaging the results of the experiment infinitely many times.

$$
E [X] = \sum_{i = 1}^n x_i \cdot f(x_i)
$$

$$
E [X] = \int_{-\infty}^{+\infty} x \cdot f(x) \ dx
$$

**Variance.** The variance of a random variable, often noted $$\mathcal{Var}[X]$$, is a measure of the spread of its distribution function.

$$
\mathcal{Var}(X) = E[(X − E[X])^2] = E[X^2] − E[X]^2
$$

---

## **Some Inequalities**

**Markov's inequality.** Let $$X$$ be a random variable and $$a > 0$$, then

$$
P (X\geq a)\leq {\frac {{E} (X)}{a}}
$$

**Chebyshev's inequality**. Let $$X$$ be a random variable with expected value $$\mu$$, then

$$
P(| X - \mu| \ge k \sigma) \leq \frac{1}{k^2}
$$

