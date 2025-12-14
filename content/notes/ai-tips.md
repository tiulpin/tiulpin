---
date: 2025-12-14
title: AI Tips
tags:
    - tips
    - programming
    - engineering
    - ai 
---

Here I collect AI coding tips I find useful, based on my experience and [this HN discussion](https://news.ycombinator.com/item?id=46255285). The most important one: [[notes/write-the-damn-code|write the damn code]]. Don't become a prompt refiner.

## Use project rules

Put stuff the model repeatedly gets wrong into `CLAUDE.md`. Document coding conventions, domain terms, how to run tests. Update it whenever the model annoys you the same way twice.

## Plan before coding

Use plan mode. For big tasks, have the model generate a spec, then architecture docs, then TODO lists. Only then let it implement small, well-scoped tasks.

## Give it ways to self-check

Provide test commands. Let it run tests in a loop until they pass. For UI, attach browser tools so it can see the actual rendered page.

## Treat it like a new dev

Break work into small tasks. Give technical descriptions plus relevant files. Let it plan and ask questions. You stay focused on architecture; it does plumbing.

## Start from a reference

Hand-code one instance well. Commit it. Tell the model to follow that pattern for the rest.

## Use it where it shines

AI is great for: repetitive similar changes, JSON wrangling, generating tests for existing code. It's worse for designing systems from scratch with vague requirements.

## Reset often

Don't use endless chats. One conversation per task. Instructions stop influencing output after many turns. Start fresh frequently.

## Be explicit

Never just say "build feature X" and leave. Explain the desired end state. Make the model restate requirements. Review every diff.

## Think specific tools, not "AI"

Ask: do I need better autocomplete? One-off code examples? Boilerplate? Use LLMs where you understand the domain well enough to verify results.
