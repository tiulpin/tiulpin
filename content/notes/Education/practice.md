---
date: 2021-09-01
title: Algorithms practice
tags:
  - math
  - education
---

> [!TIP]
> I spent a lot of time writing it in LaTeX, this page will stay here at least to test the rendering of the math formulas on the blog!
> 
> Also, if you find a mistake in any solution, I can buy you a beer 🍺.

### Problem 1

$$ \min(f(n), g(n)) = \Theta(f(n) + g(n)) $$ is false, counterexample: $$f(n) = n, \, g(n) = 1.$$

### Problem 2

$$
\max(f(n), g(n)) =
\begin{cases}
f(n), & \text{if } f(n) \geq g(n), \\
g(n), & \text{if } g(n) \geq f(n).
\end{cases}
$$

Also, $$ g(n) \leq f(n) + g(n) $$ and $$ f(n) \leq f(n) + g(n) $$, therefore:

$$
\max(f(n), g(n)) = O(f(n) + g(n)).
$$

Additionally, $$ f(n) + g(n) \leq 2 \max(f(n), g(n)) $$, so:

$$
\max(f(n), g(n)) = \Omega(f(n) + g(n)).
$$

Thus:

$$
\max(f(n), g(n)) = \Theta(f(n) + g(n)) \quad \text{– True}.
$$

### Problem 3

To verify: compute the limits.

From the top — the slowest growing function, from the bottom — the fastest growing.

- $$ \log_2 \log_2 n $$
- $$ \sqrt{\log_4 n} $$
- $$ \log_3 n $$
- $$ (\log_2 n)^2 $$
- $$ \sqrt{n} $$
- $$ n \log_5 n $$
- $$ \log_2 (n!) $$
- $$ 2^{\log_2 n} $$
- $$ n^2 $$
- $$ 7^{\log_2 n} $$
- $$ (\log_2 n)^{\log_2 n} $$
- $$ n^{\log_2 n} $$
- $$ n^{\sqrt{n}} $$
- $$ 2^n $$
- $$ 4^n $$
- $$ 2^{3n} $$
- $$ n! $$
- $$ 2^{2^n} $$

### Problem 4 

Let's construct a graph: for each element of the permutation $$a[i]$$, we draw a directed edge to $$i$$.

Selection sort will perform $$n - k$$ swaps, where $$k$$ is the number of cycles in the graph.

In the constructed graph, there are only cycles, and each vertex is part of a cycle since exactly one edge leaves each vertex. Therefore, the maximum number of swaps occurs when the graph contains only one cycle.

Let's calculate the number of such permutations: take some vertex $$v_1$$ at the beginning of our cycle—an edge from it can be directed to $$n - 1$$ vertices since we can draw an edge to any vertex except $$v_1$$; let this be vertex $$v_2$$. For drawing an edge from $$v_2$$, $$n - 2$$ vertices are available. Finally, we can proceed this way up to vertex $$v_n$$, and from $$v_n$$ draw an edge back to $$v_1$$ to complete the cycle.

As a result, the number of such permutations is $$ (n - 1)! $$.

### Problem 5

On the $$i$$-th step, bubble sort places the maximum value from the modified slice $$[0; n - i - 1]$$ at the end of the array. For $$n - 1$$ iterations, on each iteration $$i$$, the maximum value in the slice $$[0; n - i - 1]$$ must be at index $$k \neq n - i - 1$$. This is possible only if the last element of the array is one. There are $$ (n - 1)! $$ such permutations because the $$n - 1$$ elements are in arbitrary order, and one is at the end of the array.

### Problem 6

#### Proposed Algorithm

We solve the problem using the "divide and conquer" method. Suppose that after some iterations, the problem is being solved for the segment from $$l$$ to $$r$$, and the results have already been calculated for $$[l, m)$$ and $$[m, r)$$, where $$ m = \frac{l + r}{2} $$.

For each segment, the prefix and suffix sums have been calculated in sorted order—$$ \text{prefL}[\,], \text{prefR}[\,], \text{suffL}[\,], \text{suffR}[\,] $$.

Since the results for $$ [l, m) $$ and $$ [m, r) $$ have already been computed, we are interested only in the sums that start in $$ [l, m) $$ and end in $$ [m, r) $$.

Next, we need to iterate over the suffix sums of the first segment and select the prefix sums of the second so that their total sum does not exceed $$ k $$.

To do this, we can use two pointers: set the first pointer $$ i $$ at the beginning of the suffix sums array of the segment $$ [l, m) $$—$$ \text{suffL}[\,] $$, and the second pointer $$ j $$ at the end of the prefix sums array $$ [m, r) $$—$$ \text{prefR}[\,] $$.

Now we will decrease the second pointer as long as the sum $$ \text{suffL}[i] + \text{prefR}[j] > k $$.

When $$ j $$ stops decreasing, we add $$ j + 1 $$ to the result, since for all $$ t \leq j $$, $$ \text{suffL}[i] + \text{prefR}[t] \leq k $$. Thus, we have counted all sums that are possible when we have taken $$ \text{suffL}[i] $$; we move $$ i $$ one step to the right and repeat the selection algorithm for $$ \text{prefR}[\,] $$.

Obviously, the results that start in $$ [l, m) $$ and end in $$ [m, r) $$ can be calculated in $$ r - l $$ operations, since $$ i $$ only increases and $$ j $$ decreases because $$ \text{suffL}[i] $$ increases, so we need to decrease $$ \text{prefR}[j] $$. Then, we need to somehow combine $$ \text{suffL}[\,] $$ and $$ \text{suffR}[\,] $$, $$ \text{prefL}[\,] $$ and $$ \text{prefR}[\,] $$ to get the sums for $$ [l, r) $$.

Add to all elements of $$ \text{suffL}[\,] $$ the value $$ \text{suffR}[r - 1] $$, and to all elements of $$ \text{prefR}[\,] $$ add $$ \text{prefL}[m - 1] $$, since we need the sums on the whole segment.

Now we can simply merge these sums (in linear time) to obtain the required result.

#### Time Complexity Analysis

Initially, we have $$ n $$ segments of length $$ 1 $$; after pairwise merging, we have $$ \frac{n}{2} $$ segments. Each iteration reduces the number of segments by a factor of 2; the number of iterations will not exceed $$ \log(n) $$. In each iteration, according to the proposed algorithm, $$ \mathcal{O}(n) $$ operations are performed. The total complexity of the algorithm is $$ \mathcal{O}(n \log n) $$.

### Problem 7

The given array $$A$$, after the manipulations performed on it, can be divided into three arrays:

- $$X$$: decreasing array
- $$Y$$: increasing array
- $$Z$$: decreasing, and every element of $$Z$$ is greater than every element of $$X$$

The minimal element of $$A$$ can be located at one of two positions:

1. The last element of $$Y$$
2. The first element of $$Z$$

The maximal element of $$A$$ can be located at one of two positions:

1. The last element of $$X$$
2. The first element of $$Y$$

If we find the pair of indices ($$i_{\text{min}}$$ and $$i_{\text{max}}$$) of the minimal and maximal elements of $$A$$, then the problem can be solved by binary search on $$X$$, $$Y$$, and $$Z$$.

To find the indices, we need to perform a binary search with $$F(e) = e > A[0]$$—we obtain a monotonic sequence of zeros and ones. Then, using binary search, we find the index $$k$$ of the first one: $$A[k]$$ can be either in $$Y$$ or be the first element of $$Z$$.

We check whether $$A[k]$$ is the first element of $$Z$$. To do this, it is necessary that the inequalities $$A[k - 1] > A[k - 2]$$ and $$A[k] > A[k + 1]$$ hold.

- If $$A[k]$$ is the first element of $$Z$$, then $$i_{\text{max}} = k$$.
- Otherwise, $$A[k]$$ is an element of $$Y$$. Then we perform a binary search with $$F(m) = A[m] > A[m + 1]$$ on $$A[k]$$ to $$A[N - 1]$$ to find $$i_{\text{max}}$$ (where $$N$$ is the size of $$A$$).

To find $$i_{\text{min}}$$, we need to perform a binary search with $$F(m) = A[m] < A[m + 1]$$ on $$A[0]$$ to $$A[i_{\text{max}}]$$. Then we obtain:

- **$$X$$**: $$A[0]$$ to $$A[i_{\text{min}}]$$—monotonically decreasing
- **$$Y$$**: $$A[i_{\text{min}} + 1]$$ to $$A[i_{\text{max}}]$$—monotonically increasing
- **$$Z$$**: $$A[i_{\text{max}}]$$ to $$A[N - 1]$$—monotonically decreasing

Thus, the solution to the problem is to perform three binary searches on $$X$$, $$Y$$, and $$Z$$. The algorithm solves the problem in $$O(\log n)$$ time.

### Problem 8

Given that $$A[1..n]$$ satisfies $$A[1] < A[2] < \dots < A[n]$$ (strict inequality), and $$A \in \mathbb{Z}$$, then:

$$
\forall i: A[i] < A[i + 1] \implies A[i] \leq A[i + 1] - 1
$$

By induction, $$A[0] \leq A[i] - i$$. Then we construct an array $$C$$ such that $$C[i] = A[i] - i$$, where:

$$
C[0] \leq C[1] \leq C[2] \leq \ldots \leq C[n]
$$

We will search for zero using binary search; accordingly, we solve the problem in $$O(\log n)$$ time.

### Problem 9

#### By Position

In the interval:

$$
\left[ \left\lceil \frac{n}{2} \right\rceil - \frac{k}{2},\ \left\lceil \frac{n}{2} \right\rceil + \frac{k}{2} \right]
$$

(denoted as $$[l; r]$$), there are $$k$$ closest elements by position.

We find the $$l$$-th and $$r$$-th order statistics and perform two `Partition` operations:

1. On the entire array by the $$r$$-th order statistic.
2. On the subarray $$[1, r]$$ by the $$l$$-th order statistic.

In $$[l; r]$$, there will be elements that would be in those positions in the sorted array. This solution works in $$O(n)$$ time since order statistics and `Partition` operations work in $$O(n)$$.

#### By Value

The $$k$$ elements closest to the median by value in the sorted array form a segment containing the median.

Let $$m = \left\lceil \frac{n}{2} \right\rceil$$. We find the median, the $$(m - k)$$-th, and the $$(m + k)$$-th order statistics and perform partitioning with respect to them.

We will search for the segment boundaries in $$[m - k, m]$$ and $$[m, m + k]$$.

In each iteration:

- In the left and right segments, take the middle elements—$$l$$ and $$r$$.
- Partition the left segment by the $$(l - 1)$$-th and $$l$$-th order statistics, and the right segment by the $$r$$-th and $$(r + 1)$$-th.
- Consider the segment $$[l, r]$$:
    - If the inequality $$a[m] - a[l] > a[r + 1] - a[m]$$ holds, then this segment needs to be shifted to the right (meaning the left boundary should be moved right of $$l$$, and the right boundary right of $$r$$).
    - The opposite case is expressed similarly, with the inequality $$a[m] - a[l - 1] < a[r] - a[m]$$.

Thus, in each iteration, we will reduce the size of the segments by half until convergence.

The elements located between the right and left boundaries of the segment will be the desired result (partitioning was performed each time).

In each iteration, the number of operations is linear with respect to the length of the intervals, totaling:

$$
c k + \frac{c k}{2} + \frac{c k}{4} + \dots \leq c k \left( \sum_{i=0}^\infty \frac{1}{2^i} \right) = 2 c k
$$

The proposed algorithm solves the problem in $$O(n)$$ time (taking into account finding the median and initial partitions).


### Problem 10

**a.** At each step (from 0 to $$N$$), we will:

- Remove elements from the end of **s** while **a[l] ≥ a[c]**, where **l** is the last element in the stack, and **c** is the current index being considered.
- Set **a[-1]** equal to negative infinity **(-inf)**.
- The last element in **s** after all operations will be the answer for **c** (we add it to the result array). If **s** is empty, there are no elements to the left that are less than **a[c]**.
- Add **c** to the stack **s** and proceed to the next step.

**b.** \- (No content provided)

**c.** Given a matrix $$a$$ with $$n$$ rows and $$m$$ columns.

We will find $$d[i][j]$$—the nearest one above $$a[i][j]$$.

- If $$a[i][j] = 1$$, then $$d[i][j] = i$$.
- If $$i = 0$$ and $$a[i][j] = 0$$, then $$d[i][j] = -1$$.
- Otherwise, $$d[i][j] = d[i - 1][j]$$.

That is, if $$d[i][j] = -1$$, it implies there are no ones above $$a[i][j]$$.

We consider that each non-zero submatrix is defined by four boundaries.

We will attempt to find all possible lower boundaries of the desired largest zero submatrix—let's iterate and assume it is row $$i$$.

The desired submatrix touches a cell with a one or the boundary of matrix $$a$$ at the top.

Next, we iterate over all possible positions where the submatrix touches a cell with a one above. To do this, we go through all columns $$j$$; for each, we find the value $$d[i][j]$$ and take it as the exclusive upper boundary.

Now that we have the upper boundary, we need to find the left and right boundaries.

To find the left boundary, we move along the columns to the left. If in the current column $$l$$, where $$l < j$$, the inequality $$d[i][l] > d[i][j]$$ holds, then $$l$$ is the exclusive left boundary.

Similarly, moving from $$j$$ to the right, we find the first such column $$r$$ for which $$d[i][r] > d[i][j]$$.

We calculate the area: the left, right, and upper boundaries lie outside the rectangle, and the lower boundary is inside it. The area is:

$$
S = (i - d[i][j]) \times (r - l - 1)
$$

The maximum among all computed areas is the required answer to the problem.

To ensure the algorithm has a complexity of $$O(nm)$$, we will compute the left and right boundaries in the same way as we solved Problem 2.a (using a stack).

### Problem 11

Let the weights of the items be $$x_0, x_1, \dots, x_{n-1}$$. We define $$W = x_0 + x_1 + \dots + x_{n - 1}$$. If we receive a query with a weight greater than $$W$$, we immediately answer $$0$$ (not possible / `False`). Also, for weight zero, we trivially answer $$1$$ (possible / `True`).

We create a table $$d$$ of size $$n \times W$$ and initialize it with $$-\infty$$. For each element $$i$$, we record which sums are possible to obtain, indicating in this table the maximum possible index $$j$$ that needs to be taken to achieve this sum on the segment from $$i$$ to $$j$$.

For the first number, we can only obtain the sum $$x_0$$:

$$
d[0][x_0] = 0.
$$

This means that to obtain the weight $$x_0$$ on the segment ending at index $$0$$, we must also choose index $$0$$ as the start of the segment.

We fill the second row as follows: if $$j > x_1$$, then:

$$
d[1][j] = \max\left(d[0][j],\ d[0][j - x_1]\right);
$$

otherwise:

$$
d[1][j] = d[0][j] = 1.
$$

We fill all subsequent rows similarly, obtaining the following recurrence:

- If $$j < x_i$$, then:

  $$
  d[i][j] = d[i - 1][j];
  $$

- If $$j = x_i$$, then:

  $$
  d[i][j] = j;
  $$

- If $$j > x_i$$, then:

  $$
  d[i][j] = \max\left(d[i - 1][j],\ d[i - 1][j - x_i]\right).
  $$

Thus, we have dynamically filled the table $$d$$ in $$O(nW)$$ time—this is the preprocessing step.

To answer the original question (whether it is possible to obtain a subset of items within a given range), we check the condition $$d[R][w] \geq L$$. If it holds, then the answer is $$1$$ (possible); otherwise, $$0$$ (not possible). Therefore, we can answer each query in $$O(1)$$ time.

### Problem 12

If the array $$a$$ consists of one element, then the answer is that element. If it consists of two elements, then the longest palindromic subsequence is either the entire sequence (if both elements are equal) or one of the elements. If it consists of three elements, we need to compare the first and third elements: if they are equal, the answer is the entire sequence $$a$$; otherwise, the problem reduces to the case with two elements.

Let $$d[i][j]$$ be the length of the longest palindromic subsequence in $$a[i..j]$$. The solution to the problem is found in $$d[0][n - 1]$$.

We define the recursive formula:

- If $$i > j$$, then:

  $$
  d[i][j] = 0 \quad \text{(empty sequence)};
  $$

- If $$i = j$$, then:

  $$
  d[i][j] = 1 \quad \text{(a single element)};
  $$

- If $$a[i] = a[j]$$, then:

  $$
  d[i][j] = 2 + d[i + 1][j - 1];
  $$

- If $$a[i] \neq a[j]$$, then:

  $$
  d[i][j] = \max\left(d[i + 1][j],\ d[i][j - 1]\right).
  $$

By filling the table $$d$$ using this recurrence, we can solve the problem in $$O(n^2)$$ time.

### Problem 13

Let's create a modified doubly-linked list as follows: besides two pointers we will store separately from the node some bit $$b$$ - it will determine which of the pointers to use to move to the next/previous element, and in the head of the list we will additionally store a pointer to the tail of the list, also in the tail a pointer to the head of the list.

Let's expand the list: swap the head and tail pointers, invert the value $$b$$ - this way we have expanded the list in constant time, all other operations will be performed as before.

### Problem 14

We will store the given table in a doubly-linked list. And we will also assume that we store some pointer to the original value stored in a cell of the table (by the condition the cell contents are not defined), for example $$$[0, 0]$$**.**.

Then, for example, the table $$3\times3$$ (and for the sake of example, we will also select the area from which rotation is possible):

|            |            |            |
|------------|------------|------------|
| $$[0, 0]$$ | $$[0, 1]$$ | $$[0, 2]$$ |
| $$[1, 0]$$ | $$[1, 1]$$ | $$[1, 2]$$ |
| $$[2, 0]$$ | $$[2, 1]$$ | $$[2, 2]$$ |

And as a result of rotating the highlighted part by 180', this table will have the following form:

|            |            |            |
|------------|------------|------------|
| $$[1, 2]$$ | $$[1, 1]$$ | $$[1, 0]$$ |
| $$[0, 2]$$ | $$[0, 1]$$ | $$[0, 0]$$ |
| $$[2, 0]$$ | $$[2, 1]$$ | $$[2, 2]$$ |

And the bi-linked list for storing the initial table $$3\times3$$ from the example will look like this:

> $$[0, 0]$$**🔁**$$[0, 1]$$**🔁**$$[0, 2]$$**🔁**$$[1, 0]$$**🔁**$$[1, 1]$$**🔁**$$[1, 2]$$**🔁**$$[2, 0]$$**🔁**$$[2, 1]$$**🔁**$$[2, 2]$$

As a result, we will rotate some piece of the table $$n \times n$$ as follows for $$O(n)$$:

- Let's exchange the pointers of the boundary cells of the chunk on the left and on the right
- Also at the “beginning” of the chunk (top left) and at the “end” (bottom right), we will write a bit $$$b$$ that determines that there was a rotation

In the worst case, there are $$2n$$ such boundary cells, so we claim that the rotation is realized in linear time. As a result, $$m$$ rotation operations of arbitrary rectangular pieces of the table can be accomplished in $$O(nm)$$.

And the output of the whole table is possible in $$O(n^2)$$: as a usual traversal of such a list, but we will look whether in each cell that we traverse there is a $$b$$ bit defining the rotation:

- if there isn't, we traverse the list as usual—move to the next element with the `next` pointer
- if there is, then we use the `prev` pointer to move to the next element

### Problem 15

Since the problem is solved offline, we know all the deletion requests in advance.

Suppose we have an empty graph to which we can add an edge (let's add the edge of the last query, penultimate query, and beyond). Then our problem is inverted and we try to solve the problem of counting connectivity components after adding any edge. Here we can also apply SNM - each connectivity component = one set in SNM (they are merged when adding edges). It turns out that the complexity of such a solution by using SNM is $$O(m \log^{\ast} n)$$.

### Problem 16

Since the problem is solved offline, we know all $$q$$ queries in advance.

To solve the problem, we use SNM (with path compression heuristics), where in each cell we store a reference to the unpainted cell nearest to the right (i.e. at the very beginning the cell points to itself). After painting the first subtrack, the cell before the start of the subtrack will point to the cell after the end of the subtrack.

We will process the queries in reverse order. So when we execute a query, we need to paint exactly certain cells in the segment $$[l, r]$$. All other cells already contain their final color. To execute each query we will use SNM: find the leftmost unpainted cell inside the segment, paint it in color $$c$$, and with a link move to the next unpainted “empty” cell to the right.

As a result, the problem will be solved in $$O(k\log n)$$, where $$k$$ is the number of queries.

> That is, in this solution we failed to achieve the asymptotics specified by the condition, I will wait for the analysis

### Problem 17

Let's assume that painting in white is a $$0$$ entry in a cell, and painting in black is a $$1$$ entry.

Then we have three types of queries

1. Assigning $$0$$ to a cell.
2. Assigning $$1$$ to cell $$0$$.
3. Searching for the $$k$$th zero.

We will store in the vertices of the segment tree the number of zeros occurring in the corresponding sub segments of the array (tape). Let us construct such a segment tree for $$O(n)$$.

We will go down the segment tree starting from the root and move to the left or right descendant depending on which of the segments contains the $$k$$-zero. That is, to understand which descendant to move to, you need to look at the value in the left descendant - if it is greater than or equal to $$k$$, then move to the left descendant (its segment has at least $$k$$ zeros), otherwise move to the right descendant. Executed for $$O(\log n)$$.

A query with assignment $$0$$ or $$1$$ in our case means adding or decreasing the number of zeros we store in a certain vertex - that with the tree is executed for $$O(\log n)$$.

### Problem 18

Let's start a segment tree to store the tape. Let's assume that coloring in white for a ribbon cell is assigning $$0$$ to the corresponding array element, coloring in black is assigning $$1$$. And in each vertex, except for the left and right borders of the sub segments we will store

- the number of consecutive black segments inside the segment (number of sections), for which the vertex is responsible - the sum of the number of sections of each subline (but if one subline ends at 1 and the other begins at 1, we will subtract one).
- mark whether the data in the vertex is up to date.

Let's fill such a tree for $$O(n)$$.

We will perform the value assignment operations in the same way as in the previous problem, but while we are going down the tree until the value is set in the leaf, we will mark all visited vertices as requiring an update.

For requests for the number of sections to actual sub-trunks, the answer will always be ready, and if the request falls on a sub-trunk that is marked as requiring an update, we will push the update (from top to bottom to the required sub-trunk) and thus count the number of sections. That is, all operations can be performed in $$O(\log n)$$.

### Problem 19

We will create a tree for each axis—one for the $$Ox$$ axis and one for the $$Oy$$ axis—to enable quick minimum and maximum searches along both axes. In each node of the $$Ox$$ tree, we will store a reference to the corresponding node in the $$Oy$$ tree. This ensures synchronization between the trees during insertions and deletions.

Since trees allow us to quickly find minimum and maximum values, calculating the area of the minimal rectangle is straightforward:

$$
(x_{\max} - x_{\min}) \times (y_{\max} - y_{\min})
$$

where $$x_{\min} \geq l$$ and $$x_{\max} \leq r$$.

Therefore, the complexity of insertion or deletion operations is $$O(2 \log n)$$.

The complexity of finding the area is $$O(4 \log n)$$.

### Problem 20

We use the data structure for storing points on a plane from the previous problem; effectively, we "overlay" a grid on our polygon.

To determine whether a point lies within the rectangle, we conceptually draw an arbitrary line from the point (we simply search for the corresponding cell):

- If the line does not intersect any of the sides, the point is outside.
- If there are intersections with the sides of the polygon, the point is inside if the number of intersections is odd.

The query for one point in one cell is $$O(\log n)$$. For $$n$$ points and $$m$$ vertices, the total complexity is $$O\left((n + m) \log n\right)$$.

### Problem 21

A set of keys is divided into three groups:

1. keys up to $$start$$
2. keys in the interval $$[start; start + k]$$
3. keys after $$start $$+\mathrm{k}$$ .

During the loop execution, the vertices before $$start$$ will be accessed at most $$\log n$$ times. The same is true for the vertices after $$start +\mathrm{k}$$, because by the condition the tree is balanced

Because of the peculiarities of calling $$next$$ on consecutive keys, we will visit each vertex from $$start$$ to $$start + k$$ at most a constant number of times, but only $$O(k)$$.

Thus we proved $$O(\log n+k)$$.

