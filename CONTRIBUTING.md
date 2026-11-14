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

- `common`: shared development/work CLIs, including cloud tools and coding agents.
- `workstation`: common plus desktop apps and YubiKey tools.
- `mini`: common plus OrbStack; no App Store apps.
- `optional-cli`, `optional-apps`: other tools from the installed inventory.
  Bootstrap skips these files. Move entries into a profile when needed.

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

Review the dump before updating manifests. Avoid `brew bundle cleanup --force`:
it would uninstall optional tools that are deliberately outside the default
profile. Use project configuration to pin runtime versions.

### Installation sources

| Tool | Installation |
| --- | --- |
| Claude Code | `claude-code` cask. Workstation skips it while the native `~/.local/bin/claude` exists, avoiding a duplicate installation. |
| TeamCity, YouTrack, JCP | `jetbrains/utils` formulae in common |
| Airlock | [Release installer](https://github.com/JetBrains/airlock-cli#install), using `gh` authentication |
| Central CLI | [Vendor installer](https://www.jetbrains.com/help/central-cli/cli-setup.html); no matching Brew package found |
| Space CLI | Existing internal distribution; confirm the installer before deploying to mini |
| Rex | [Vendor download](https://www.superlogical.com/rex/docs/installation). The Brew formula named `rex` is a different product. |
| Herdr app and `herdr-core`/`hc` | [App installer](https://herdr.dev/download/) or [runtime installer](https://herdr.dev/core/). Brew's `herdr` installs the TUI, not these binaries. |
| Air Control, Central desktop | Vendor/internal installers |
| IntelliJ IDEA/EAP, JetBrains Light | Toolbox; managed separately |
| Yeti Dev | Local build. Yeti Alpha is in workstation; stable Yeti is optional. |
| `yt`, `herdr-app`, `docker-credential-space`, Claude Code URL Handler | Helpers installed with their parent tools |
| GKE authentication plugin | `gcloud components install gke-gcloud-auth-plugin`; handled by bootstrap |
| Rust | Native rustup found in `~/.cargo/bin`; Brew `rustup` is an optional alternative, not an additional installation |

Craft, Happ, Hidden Bar, NordVPN, Slack, WhatsApp and Windows App also have Brew
casks. The manifests retain their existing App Store channel. Check product
identity before switching: the `flow` formula and `gifski` formula are CLIs, and
Brew's `outline` is a note-taking app.

### Audit, 2026-11-14

The shell-history sample covers October 15 through November 13.
Airlock (123), Claude (61), Codex (45), Central (26), TeamCity (25), kubectl (13),
Go (13), scc (13), gh (10), op (10), Space (9), YouTrack (9) and gcloud (8) have
direct usage evidence. Shared tools also include shell/bootstrap dependencies,
JDK 21 for Gradle work and golangci-lint for the Airlock/Central projects.
Shell history misses agent commands and indirect script calls; optional means
unconfirmed in this sample, not unused.

The mini had `gh`, Codex and OrbStack installed through Brew, with almost no shell
history. Its profile uses workstation CLI needs. Airlock, Central and Space still
need their vendor installers and host-specific sign-ins.

Desktop last-used dates were unavailable. The workstation profile keeps apps
observed running, setup tools, and the explicitly retained iMovie, Logic Pro,
GarageBand and LM Studio. Other installed apps remain available in optional-apps.
Changing a manifest does not uninstall an app. Keep IntelliJ installations under
separate management. Junie and Grazie are excluded from all profiles.

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
