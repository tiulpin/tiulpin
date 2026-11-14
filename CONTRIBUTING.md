# Contributing

This repo contains the [tiulp.in](https://tiulp.in/) Quartz site and personal
dotfiles managed by [yadm](https://yadm.io/), with `$HOME` as the worktree.

## New machine

```bash
xcode-select --install
brew install go yadm
yadm clone --no-bootstrap https://github.com/tiulpin/tiulpin.git
yadm config local.class workstation # use mini on the Mac mini
yadm bootstrap
```

Review the [Go setup program](.config/yadm/setup/bootstrap.go) before running it. Its prompts cover
packages, CLI integrations, macOS preferences and tmux/vim configs. Workstation
setup also offers YubiKey configuration and an SSH remote for yadm. Setup requires
Go 1.22 or later and uses no third-party Go packages.
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

## Machine-specific configuration

Shared Git config includes `~/.gitconfig.local`; shared SSH config includes
`~/.ssh/config.local`. Both files are ignored. Keep signing keys, credential
helpers, host aliases and agent selection there. Existing workstation settings
were moved into these files; a fresh machine starts without mandatory signing.

`.zshrc` preserves `SSH_AUTH_SOCK` and loads an optional ignored `~/.zshrc.local`.
It skips integrations whose tools are not installed yet. A fresh mini can use its
own agent without the workstation's GPG socket. To select an agent explicitly,
set `IdentityAgent` in that machine's `.ssh/config.local`.

The optional YubiKey step verifies the tracked public key and offers to enable
local GPG commit signing. Authentication and signing credentials stay on each
host. Agent/Rex settings are not tracked here; port configuration separately
from credentials.

`.node-version` is the Node version for this repo and its Node-based CI workflows.
Homebrew provides the system runtime; project version managers must read
`.node-version` if an exact version is needed.

## Setup development

`.config/yadm/bootstrap`, `check-tools` and `macos` are launchers for the Go
program in `.config/yadm/setup`. Shell startup stays in zsh. Go setup invokes
tools with argument arrays; it does not build shell command strings.

```bash
go -C ~/.config/yadm/setup test ./...
go -C ~/.config/yadm/setup vet ./...
```

The Dotfiles workflow checks the Go program, shell launchers and package profiles,
and previews macOS preferences. Tests use temporary homes and fake command
runners to cover backups, power restrictions, repeat runs and local overrides.
Existing vim/tmux checkouts are kept; conflicting paths produce an error.

## macOS preferences

[macos](.config/yadm/macos) runs the Go preferences command, using settings sampled from the main Mac on
2026-11-13: keyboard/text input, language and region, Finder, Dock, trackpads,
screenshots, Activity Monitor and Terminal. Check the results after macOS upgrades;
some keys are undocumented.

```bash
~/.config/yadm/macos                              # preview only
~/.config/yadm/macos --apply                      # apply shared preferences
~/.config/yadm/macos --profile mini --power       # preview shared + server power settings
~/.config/yadm/macos --profile mini --power --apply
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
- Setup steps: edit `.config/yadm/setup/`. Shell configuration is in `.zshrc`
  and `.zprofile`, macOS values in `setup/preferences.go`, and GPG settings in `.gnupg/`.
- Sync: use `yadm pull --rebase` with a clean worktree.
- Keep site and dotfile changes in separate commits when practical.
