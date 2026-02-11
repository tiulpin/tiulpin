---
date: 2026-02-11
title: I Don't Want My Terminal to Be a Platform
translationKey: notes/breaking-up-with-warp
tags:
    - terminal
    - tools
---

I've been a warp.dev user since December 2021. I evangelized it to everyone – friends, colleagues, strangers on the internet. A terminal that *gets it*. Fast, modern, beautiful.

Then it got an AI agent. And a notebook. And voice input. And cloud agents. And probably a dating feature by next Tuesday.

I never used Warp's AI features. A terminal doesn't need to be smart – it needs to be fast and stay out of my way. For other things, I have other tools.

Every update felt like opening my terminal and finding a new couch in there. I just wanted to run `git push`, not onboard into a platform. The final straw? A recent Warp update started freezing Claude Code mid-session.

## The Enshittification Speedrun

Warp went from "great terminal for developers" to "enterprise SaaS with a terminal attached" in about one quarter. Credits vanished, pricing changed overnight; cancellation got buried three menus deep. The [subreddit](https://www.reddit.com/r/warpdotdev/comments/1p9d3rv/warps_recent_changes_feel_rushed_confusing_and/) reads like a support group.


## The Switch

```bash
brew install --cask ghostty@tip
```

Ghostty finally has search. That was literally the only feature keeping me on Warp. One feature. Warp shipped 847 features I didn't ask for, and the one I needed took Ghostty a single release to nail.

Ghostty launches in 0.2 seconds. It doesn't have opinions about my workflow. It doesn't want to be my copilot. It doesn't need me to sign in. To my terminal. To run `ls`.

It's a rectangle that runs commands. Beautiful.

## The Setup

Ghostty + [antigen](https://github.com/zsh-users/antigen) + [powerlevel10k](https://github.com/romkatv/powerlevel10k). Full config in my [dotfiles](https://github.com/tiulpin/tiulpin).

The one thing I actually miss from Warp? The prompt pinned to the bottom. Four lines of zsh:

```bash
function _prompt_at_bottom() {
  printf '\n%.0s' {1..$LINES}
  precmd_functions=(${precmd_functions:#_prompt_at_bottom})
}
precmd_functions+=(_prompt_at_bottom)
```

---

The best software doesn't make you think about it. Warp made me think about it every day – by adding something new to think about, then trying to charge me for it.

Ghostty just sits there. Being a terminal. Revolutionary.
