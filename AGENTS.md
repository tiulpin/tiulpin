# AGENTS.md

These are my defaults for every project. My home directory is also a yadm repo that holds my dotfiles and the tiulp.in site. Notes for each part of that repo live in nested AGENTS.md files.

## Working with me

- Make the smallest change that solves the task, and stay inside its scope. Add tests, docs, helpers or features only when I ask.
- Keep answers and plans short. Answer in the terminal unless I ask for an artifact.
- When I ask where or how, answer the question without changing anything.
- Before you design something new, check existing code, Slack, YouTrack and the web, and use the standard pattern.
- If a dev tool is missing, install it with Homebrew rather than working around it.
- Write plain English that non-native speakers can read: no idioms and no AI-style filler.

## Git and publishing

- Anything published as me must not mention AI, Claude or any model. That covers commits, PRs, tickets and comments, and it rules out `Co-Authored-By` and "Generated with" lines.
- Commit unsigned (`--no-gpg-sign`) and push using `gh` auth, unless the repo or I say otherwise.
- Write commit messages as one line in the form `type(scope): subject`.
- Keep one clean commit for each change. Amend or force-push only on branches I have approved.
- Leave the PR body empty for small fixes. Otherwise keep it short with no tables. When editing an existing description, keep what is already there.
