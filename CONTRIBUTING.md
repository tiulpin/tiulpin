# Contributing

Mostly notes for future Viktor, but anyone curious about the setup is welcome.

This repo wears two hats:

1. **Quartz site** — source for [tiulp.in](https://tiulp.in/). PR workflow is normal: fork, branch, `npm run check`, open a PR. CI runs the full `check` suite plus link-spector.
2. **Dotfiles** — managed by [yadm](https://yadm.io/) with `$HOME` as the worktree.

## New machine setup

```bash
xcode-select --install
brew install yadm
yadm clone https://github.com/tiulpin/tiulpin.git
yadm bootstrap
```

`bootstrap` (at `~/.config/yadm/bootstrap`) is interactive — it uses [`gum`](https://github.com/charmbracelet/gum) for prompts and walks through, in order:

1. **Homebrew** — self-installs if missing, then `brew bundle` from `Brewfile`.
2. **macOS defaults** — runs `./macos` (mathiasbynens-style tweaks).
3. **tmux + vim** — clones [`amix/vimrc`](https://github.com/amix/vimrc) and [`gpakosz/.tmux`](https://github.com/gpakosz/.tmux) and symlinks `~/.tmux.conf`. The upstream config files are *not* tracked here; bootstrap recreates them.
4. **GPG + SSH via YubiKey:**
   - Locks down `~/.gnupg` perms (`700` dir, `600` files).
   - Fetches the public key from <https://log.tiulp.in/pubkey.asc> (falls back to tracked `~/.gnupg/pubkey.asc` if the site is unreachable) and trusts it ultimate.
   - Prompts you to insert the YubiKey, runs `gpg --card-status` to bind key stubs to the card, restarts `gpg-agent`.
   - SSH already routes through `gpg-agent` via `SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)` in `.zshrc`.
5. **Remote URL** — switches yadm origin from HTTPS to SSH.

> The public key is also published at <https://log.tiulp.in/pubkey.asc> and (optionally) referenced from the YubiKey itself via `gpg --card-edit` → `url` → `https://log.tiulp.in/pubkey.asc`. With that set, any clean machine can do `gpg --card-edit` → `fetch` to grab the key without touching this repo.

### Verify the YubiKey works

```bash
gpg --card-status                # should show the YubiKey
ssh-add -L                       # should list the SSH key from cardno:...
echo test | gpg --clearsign      # should prompt for PIN, then sign
```

### Manual followups

- **Register the SSH pubkey** (`~/.ssh/id_rsa.pub`) on GitHub, GitLab, JetBrains Space, etc.
- **Sign in** to apps with state outside the Brewfile: 1Password, JetBrains Toolbox, iCloud, Raycast Pro, Cursor, Claude.
- **Restore `~/.vim_runtime/my_configs.vim`** from backup if you want personalization beyond the amix defaults.

## What's where

| Path | Purpose |
|---|---|
| `Brewfile` | Single source of truth for installed apps/tools. Refresh with `brew bundle dump --force --describe`. |
| `.zshrc` | antigen + powerlevel10k; path/fpath in arrays. |
| `.gitconfig` | Signing key + aliases. `up` / `dcb` glob `*master*` (works on `main` too). |
| `.gnupg/*.conf` | pinentry-mac, ssh-support, 8h cache, `keys.openpgp.org` keyserver. |
| `.gnupg/pubkey.asc` | Exported GPG public key (private material lives on the YubiKey). Mirrored at `quartz/static/pubkey.asc` so it's served at <https://log.tiulp.in/pubkey.asc> (this Quartz site). |
| `.macos` | System defaults — re-run after big macOS upgrades. |
| `.config/yadm/bootstrap` | The bootstrap script. Edit when adding setup steps. |

## Day-to-day

- **Adding a new app/tool:** install it, then `brew bundle dump --force --describe` and review the diff before committing.
- **Editing config:** edit the file in `$HOME` directly — yadm sees `$HOME` as its worktree, no checkout dance needed.
- **Pulling on multiple machines:** `yadm pull --rebase`. Stash any in-progress site work first (the Quartz tree lives under the same repo).
- **Site changes vs. dotfile changes:** keep them in separate commits when practical — easier to rebase or revert.
