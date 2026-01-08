---
date: 2026-01-07
title: Числа затримки, які повинен знати кожен програміст
translationKey: notes/latency-numbers
tags:
    - performance
    - systems
    - engineering
---

Числа, які я тримаю під рукою для приблизних перевірок продуктивності.

Одиниці:
- 1 ns = $10^{-9}$ секунд
- 1 us = $10^{-6}$ секунд = 1,000 ns
- 1 ms = $10^{-3}$ секунд = 1,000 us = 1,000,000 ns

```
sirupsen/napkin-math

Sequential Memory R/W (64 bytes)     |█░░░░░░░░░░░░░░░░░░░░░░░| 0.5 ns
Hashing, not crypto-safe (64 bytes)  |██████░░░░░░░░░░░░░░░░░░| 25 ns
Random Memory R/W (64 bytes)         |███████░░░░░░░░░░░░░░░░░| 50 ns
Hashing, crypto-safe (64 bytes)      |███████░░░░░░░░░░░░░░░░░| 100 ns
System Call                          |█████████░░░░░░░░░░░░░░░| 500 ns
Sequential SSD read (8 KiB)          |██████████░░░░░░░░░░░░░░| 1 us
Context Switch                       |█████████████░░░░░░░░░░░| 10 us
Sequential SSD write, -fsync (8KiB)  |█████████████░░░░░░░░░░░| 10 us
TCP Echo Server (32 KiB)             |█████████████░░░░░░░░░░░| 10 us
Proxy: Envoy/ProxySQL/Nginx/HAProxy  |███████████████░░░░░░░░░| 50 us
Random SSD Read (8 KiB)              |████████████████░░░░░░░░| 100 us
Network within same region           |█████████████████░░░░░░░| 250 us
Premium network within zone/VPC      |█████████████████░░░░░░░| 250 us
MySQL, Memcached, Redis, ... Query   |██████████████████░░░░░░| 500 us
Sequential SSD write, +fsync (8KiB)  |███████████████████░░░░░| 1 ms
Sequential HDD Read (8 KiB)          |█████████████████████░░░| 10 ms
Random HDD Read (8 KiB)              |█████████████████████░░░| 10 ms
Network NA Central <-> East          |███████████████████████░| 25 ms
Network NA Central <-> West          |███████████████████████░| 40 ms
Blob Storage GET, 1 conn             |███████████████████████░| 50 ms
Blob Storage GET, n conn (offsets)   |███████████████████████░| 50 ms
Blob Storage PUT, 1 conn             |███████████████████████░| 50 ms
Network NA East <-> West             |████████████████████████| 60 ms
Network EU West <-> NA East          |████████████████████████| 80 ms
Network EU West <-> NA Central       |████████████████████████| 100 ms
Blob Storage PUT, n conn (multipart) |████████████████████████| 150 ms
Network EU West <-> Singapore        |████████████████████████| 160 ms
Network NA West <-> Singapore        |████████████████████████| 180 ms

Classic list (~2012)
L1 cache reference                   |█░░░░░░░░░░░░░░░░░░░░░░░| 0.5 ns
Branch mispredict                    |██░░░░░░░░░░░░░░░░░░░░░░| 5 ns
L2 cache reference                   |██░░░░░░░░░░░░░░░░░░░░░░| 7 ns
Mutex lock/unlock                    |█████░░░░░░░░░░░░░░░░░░░| 25 ns
Main memory reference                |███████░░░░░░░░░░░░░░░░░| 100 ns
Compress 1K bytes with Zippy         |█████████████░░░░░░░░░░░| 3 us
Send 1K bytes over 1 Gbps network    |██████████████░░░░░░░░░░| 10 us
Read 4K randomly from SSD*           |█████████████████░░░░░░░| 150 us
Read 1 MB sequentially from memory   |██████████████████░░░░░░| 250 us
Round trip within same datacenter    |███████████████████░░░░░| 500 us
Read 1 MB sequentially from SSD*     |████████████████████░░░░| 1 ms
Disk seek                            |█████████████████████░░░| 10 ms
Read 1 MB sequentially from disk     |██████████████████████░░| 20 ms
Send packet CA->Netherlands->CA      |████████████████████████| 150 ms
```

Джерело: https://github.com/sirupsen/napkin-math

```
CPU / ns

1 ns
█

L1 cache reference: ~0.5 ns
█

Branch mispredict: 5 ns
█████

L2 cache reference: 7 ns
███████

Mutex lock/unlock: 25 ns
█████
█████
█████
█████
█████

100 ns
██████████
██████████
██████████
██████████
██████████
██████████
██████████
██████████
██████████
██████████
```

```
ns → µs  [▓]

Main memory reference: 100 ns
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓

1 µs
▓▓▓▓▓
▓▓▓▓▓

Compress 1 KB with Zippy: 3 µs
▓▓▓▓▓▓
▓▓▓▓▓▓
▓▓▓▓▓▓
▓▓▓▓▓▓
▓▓▓▓▓▓

10 µs
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓
```

```
Network/latency: µs → ms  [■]

Send 1 KB over 1 Gbps network: 10 µs
■■■■■
■■■■■

SSD random read: 150 µs
■■■■■■
■■■■■■
■■■■■■
■■■■■■
■■■■■■

Read 1 MB sequentially from memory: 250 µs
■■■■■■■
■■■■■■■
■■■■■■■
■■■■■■■
■■■■■■■

Round trip in same datacenter: 500 µs
■■■■■■■■■
■■■■■■■■■
■■■■■■■■■
■■■■■■■■■
■■■■■■■■■
■■■■■■■■■
■■■■■■■■■

1 ms
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
■■■■■■■■■■
```

```
Disk/geo: ms  [▒]

Read 1 MB sequentially from SSD: 1 ms
▒▒▒▒▒▒▒▒▒▒

Disk seek: 10 ms
▒▒▒▒▒
▒▒▒▒▒
▒▒▒▒▒
▒▒▒▒▒
▒▒▒▒▒

Read 1 MB sequentially from disk: 20 ms
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒
▒▒▒▒▒▒▒

Packet roundtrip CA to Netherlands: 150 ms
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

Автори
------
- Jeff Dean: http://research.google.com/people/jeff/
- Peter Norvig: http://norvig.com/21-days.html#answers
- Jonas Bonér: https://github.com/jboner
- Simon Eskildsen: https://github.com/sirupsen

Додатково
------
- Гуманізоване порівняння: https://gist.github.com/hellerbarde/2843375
- Візуальна порівняльна діаграма: http://i.imgur.com/k0t1e.png
- Інтерактивна презентація Prezi: https://prezi.com/pdkvgys-r0y6/latency-numbers-for-programmers-web-development/latency.txt (оригінал: https://gist.github.com/jboner/2841832)
