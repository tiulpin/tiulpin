---
date: 2026-04-06
title: "Re: The Free Market Lie"
translationKey: notes/fiber-in-amsterdam
tags:
    - internet
    - infrastructure
---

![Amsterdam intersection on a foggy morning](/notes/images/fiber-in-amsterdam.jpg)

Stefan Schüller wrote a piece on [why Switzerland has 25 Gbit internet and America doesn't](https://sschueller.github.io/posts/the-free-market-lie/). He covers Switzerland, Germany, the US — but not the Netherlands.

I'm on Odido in Amsterdam. The glass in the ground belongs to KPN. Odido rents wholesale access via [VULA](https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2022/10/a-novel-approach-to-fibre-network-access-regulation-in-the-nethe.html), I pick my provider, nobody digs up the street. The topology is **[XGS-PON](https://www.overons.kpn/nieuws/en/kpn-switches-to-ultra-fast-xgs-pon-technology/)** — one fiber hits a splitter, fans out to ~32 homes, shared 10 Gbps. 30+ ISPs in the country, most addresses can choose from 5–15.

So it works. But in 2020, a Dutch court struck down the mandated open-access ruling on KPN's fiber. KPN [proposed commitments](https://www.acm.nl/en/publications/acm-meaningful-proposals-made-kpn-and-glaspoort-regarding-lower-tariffs-fiber-optic-network-access) to keep wholesaling, the regulator made them binding. They expire **August 2030**.

The Dutch model is commercially open — KPN chooses to wholesale. The Swiss model is architecturally open — four fibers per home, and when Swisscom tried switching to shared fiber, they got [blocked](https://www.bvger.ch/en/newsroom/media-releases/swisscom-must-comply-with-fibre-optic-standards-1063) and [fined CHF 18M](https://www.swissinfo.ch/eng/science/comco-gives-swisscom-2025-deadline-in-fibre-optic-dispute/76393735). One is a business decision. The other is physics. In 2030, KPN gets to make that decision again — and nothing in the cable stops them from choosing differently.
