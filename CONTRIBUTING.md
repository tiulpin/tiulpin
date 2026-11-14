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

Review [bootstrap](.config/yadm/bootstrap) before running it. Its prompts cover
packages, CLI integrations, macOS preferences and tmux/vim configs. Workstation
setup also offers YubiKey configuration and an SSH remote for yadm.
Run `yadm bootstrap --check-tools` afterward to check installed tools and plugins.

Afterward:

- Sign in to apps. For 1Password CLI, enable Settings > Developer > Integrate
  with 1Password CLI and check `op whoami`.
- Start Docker Desktop on the workstation, or OrbStack on the mini; check
  `docker info` and `docker compose version`.
- On the workstation, register the YubiKey's SSH public key with the services you use.
- Restore `~/.vim_runtime/my_configs.vim` if needed.
- Set up cloud sign-ins and kubeconfigs separately. Use `gcloud auth login` for
  GKE and `kubectl --context CONTEXT_NAME get namespaces` to check access.

For YubiKey setup, check:

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
# On the mini:
brew bundle list --all --file="$HOME/.config/yadm/brewfiles/mini"
brew bundle install --no-upgrade --file="$HOME/.config/yadm/brewfiles/mini"
```

Store Home Assistant/Pi-hole deployments, data and backups separately from package
manifests.

Keep inventory dumps separate from the dispatcher:

```bash
brew bundle dump --file=/tmp/Brewfile.installed --force
```

Review the dump before updating manifests. `brew bundle cleanup --force` removes
unlisted packages. Use project configuration to pin runtime versions.

### Manual installations

| Installed item | Restore/update path |
| --- | --- |
| Rex Beta (both Macs) | Official Rex installer and in-app updater; sign into Tailscale separately |
| Air Control, Central, Herdr | Vendor/internal installers; sources need documenting |
| IntelliJ IDEA, IDEA EAPCandidate, JetBrains Light in `~/Applications` | JetBrains Toolbox or original installer |
| Yeti Dev | Local development build; Yeti and Yeti Alpha releases are in the workstation manifest |
| Claude Code (`~/.local/bin/claude`) | Native installer on workstation; `claude-code` cask on mini |
| Claude Code URL Handler | Installed with the existing Claude setup |
| `airlock`, `central`, `space`, `herdr-core`/`hc` | Manual/internal binaries in `~/.local/bin`; restore only where needed |
| `junie` in `~/.local/bin` | Check PATH precedence against the Brew formula |
| `yt`, `herdr-app`, `docker-credential-space` | Links to Yeti, Herdr, and Space; recreate with those tools |
| `gke-gcloud-auth-plugin` | Installed through gcloud components by workstation bootstrap |

Before deploying all dotfiles to the mini, guard the unconditional Go/GPG calls
in `.zshrc`, configure Git signing independently, and review the workstation GPG
agent reference in `.ssh/config`. Agent/Rex settings are not tracked here; port
portable configuration separately from credentials. The tracked `.node-version`
and `.tool-versions` also disagree and need reconciling per project.

## macOS preferences

[macos](.config/yadm/macos) applies preferences sampled from the main Mac on
2026-11-13: keyboard/text input, language and region, Finder, Dock, trackpads,
screenshots, Activity Monitor and Terminal. Check the results after macOS upgrades;
some keys are undocumented.

```bash
bash ~/.config/yadm/macos                              # preview only
bash ~/.config/yadm/macos --apply                      # apply shared preferences
bash ~/.config/yadm/macos --profile mini --power       # preview shared + server power settings
bash ~/.config/yadm/macos --profile mini --power --apply
```

The script uses the same yadm profile as the Brewfile. Both profiles share
preferences; `--power` is available only for the mini.

Before applying, preference domains are backed up under the ignored
`~/.bootstrap/macos-*` directory. `.absent` markers identify domains that did not
exist. Backups are local recovery material; do not sync them as dotfiles.

`--power` prevents idle sleep on AC, sleeps the display after 15 minutes and enables
restart after power loss. Configure and test Rex/OrbStack startup after reboot
separately. Battery and hibernation settings stay unchanged.

Settings applied by older versions remain until explicitly changed.

## Changes

- Site: run `npm run check` before opening a PR. CI also runs link-spector.
- Packages: edit `.config/yadm/brewfiles/common`, `workstation`, or `mini`.
  `~/Brewfile` selects the profile; see [Package profiles](#package-profiles).
- Dotfiles: edit files directly in `$HOME`; use `yadm diff` to review.
- Setup steps: edit `.config/yadm/bootstrap`. Shell configuration is in
  `.zshrc`, macOS defaults in `.config/yadm/macos`, and GPG settings in `.gnupg/`.
- Sync: use `yadm pull --rebase` with a clean worktree.
- Keep site and dotfile changes in separate commits when practical.
