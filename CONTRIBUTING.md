# Contributing

This repo contains the [tiulp.in](https://tiulp.in/) Quartz site and personal
dotfiles managed by [yadm](https://yadm.io/), with `$HOME` as the worktree.

## New machine

```bash
xcode-select --install
brew install yadm
yadm clone --no-bootstrap https://github.com/tiulpin/tiulpin.git
yadm config local.class workstation # use mini on the Mac mini
yadm bootstrap
```

The interactive bootstrap installs Brewfile packages, optionally configures CLI
integrations, applies macOS defaults, installs tmux/vim configs, and sets up
GPG/SSH through a YubiKey. It verifies the public-key fingerprint before trusting
it and offers a GitHub authentication check. On the workstation it offers to switch yadm to SSH; the mini keeps its current remote.
Review the steps in [the script](.config/yadm/bootstrap) before running it.
Run `yadm bootstrap --check-tools` afterward to verify local tools and plugins
without contacting clusters or starting sign-ins.

Afterward:

- Sign in to apps. For 1Password CLI, enable **Settings → Developer → Integrate
  with 1Password CLI** and check `op whoami`.
- Start Docker Desktop on the workstation, or OrbStack on the mini; check
  `docker info` and `docker compose version`.
- Register the YubiKey's SSH public key with the services you use.
- Restore `~/.vim_runtime/my_configs.vim` if needed.
- Set up cloud sign-ins and kubeconfigs separately. Use `gcloud auth login` for
  GKE and `kubectl --context CONTEXT_NAME get namespaces` to check access.

Verify the YubiKey:

```bash
gpg --card-status
ssh-add -L
echo test | gpg --clearsign
```

Personal setup notes belong in the ignored `~/.bootstrap/` directory.
Keep tokens, kubeconfigs, account details, and private configuration untracked.

## Package profiles

`~/Brewfile` selects the profile from `yadm config local.class`, defaulting to
`workstation`. Edit the manifests under `.config/yadm/brewfiles/`:

- `common`: shared shell/development tools and Codex CLI.
- `workstation`: common plus workstation CLI tools, GUI apps and App Store apps.
- `mini`: common plus OrbStack and Claude Code CLI.

```bash
brew bundle list --all --file="$HOME/Brewfile"
brew bundle check --no-upgrade --file="$HOME/Brewfile"
# Inspect or install the mini profile explicitly on the intended machine:
brew bundle list --all --file="$HOME/.config/yadm/brewfiles/mini"
brew bundle install --no-upgrade --file="$HOME/.config/yadm/brewfiles/mini"
```

Bootstrap selects the same profile for packages and tool checks, and skips
YubiKey setup on the mini. Launch the container runtime and authenticate accounts
separately. Home Assistant/Pi-hole deployments, persistent data and backups belong
outside the Brewfile.

Keep inventory dumps separate from the dispatcher:

```bash
brew bundle dump --file=/tmp/Brewfile.installed --force
```

Review the dump before updating manifests. `brew bundle cleanup --force` removes
unlisted packages; it is not part of bootstrap. Brewfiles do not pin runtime
versions; use project-specific runtime management where needed.

### Manual installations

| Installed item | Restore/update path |
| --- | --- |
| Rex Beta (both Macs) | Official Rex installer and in-app updater; sign into Tailscale separately |
| Air Control, Central, Herdr | Existing vendor/internal installers; exact installation sources still need documenting |
| IntelliJ IDEA, IDEA EAPCandidate, JetBrains Light in `~/Applications` | Restore the required products via JetBrains Toolbox/original channel |
| Yeti Dev | Local development build; Yeti and Yeti Alpha releases are in the workstation manifest |
| Claude Code (`~/.local/bin/claude`) | Existing native installation on workstation; mini uses the verified `claude-code` cask |
| Claude Code URL Handler | Helper associated with the existing Claude setup; not a separate cask |
| `airlock`, `central`, `space`, `herdr-core`/`hc` | Manual/internal binaries in `~/.local/bin`; restore only where needed |
| `junie` in `~/.local/bin` | Existing additional launcher; review PATH precedence against the Brew formula |
| `yt`, `herdr-app`, `docker-credential-space` | Links to Yeti, Herdr, and Space; recreate with those tools |
| `gke-gcloud-auth-plugin` | Installed through gcloud components by workstation bootstrap |


Before deploying all dotfiles to the mini, guard the unconditional Go/GPG calls
in `.zshrc`, configure Git signing independently, and review the workstation GPG
agent reference in `.ssh/config`. Agent/Rex settings are not tracked here; port
portable configuration separately from credentials. The tracked `.node-version`
and `.tool-versions` also disagree and need reconciling per project.

## macOS preferences

`.config/yadm/macos` contains selected preferences read from the main Mac on 2026-11-13:
keyboard/text input, language and region, Finder, Dock, trackpads, screenshots,
Activity Monitor and Terminal. It does not export accounts, app data, Dock app
lists or the entire preferences database. Keys absent on the source Mac retain
the destination Mac's defaults. Some preferences are undocumented macOS keys;
check the visible result after an OS upgrade.

```bash
bash ~/.config/yadm/macos                              # preview only
bash ~/.config/yadm/macos --apply                      # apply shared preferences
bash ~/.config/yadm/macos --profile mini --power       # preview shared + server power settings
bash ~/.config/yadm/macos --profile mini --power --apply
```

The default profile comes from `yadm config local.class` (or `workstation` when
unset). `yadm config local.class mini` selects the mini profile. Both profiles
share preferences; only the mini permits the explicit `--power` step. This also
selects the matching Brewfile and tool checks in bootstrap.

Before applying, preference domains are backed up under the ignored
`~/.bootstrap/macos-*` directory. `.absent` markers identify domains that did not
exist. Backups are local recovery material; do not sync them as dotfiles.

The mini power step prevents idle sleep on AC, allows display sleep after 15
minutes and enables restart after power loss. It does not configure login after
reboot, start Rex/OrbStack, or guarantee services recover after a restart. Test
that separately. Laptop battery settings and hibernation are untouched.

The script does not change hostnames, timezone, security protections, software
update policies or backup policies. It does not reset Launchpad, rebuild Spotlight,
delete sleep images, import missing terminal themes or quit applications. Removing
an old setting from this script does not undo a previous application of it.

## Changes

- **Site:** run `npm run check` before opening a PR. CI also runs link-spector.
- **Packages:** edit `.config/yadm/brewfiles/common`, `workstation`, or `mini`.
  `~/Brewfile` selects the profile; see [Package profiles](#package-profiles).
- **Dotfiles:** edit files directly in `$HOME`; use `yadm diff` to review.
- **Setup steps:** edit `.config/yadm/bootstrap`. Shell configuration lives in
  `.zshrc`, macOS defaults in `.config/yadm/macos`, and GPG settings in `.gnupg/`.
- **Sync:** use `yadm pull --rebase` with a clean worktree.
- Keep site and dotfile changes in separate commits when practical.
