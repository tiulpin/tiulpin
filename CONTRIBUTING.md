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
packages, CLI integrations, macOS preferences and vim configuration. Workstation
setup also offers YubiKey configuration and an SSH remote for yadm. Setup requires
Go 1.27 or later and uses no third-party Go packages.
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

- `common`: all shared CLI tools, including Rust, Maven, Helm, CMake, FFmpeg,
  tfenv, cloud tools and coding agents. Both machines install this list.
- `workstation`: common plus desktop apps and YubiKey tools.
- `mini`: common plus OrbStack; no App Store apps.
- `optional-apps`: other desktop apps from the installed inventory. Bootstrap
  skips this file.

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
it would uninstall desktop apps kept outside the default profile. Use project configuration to pin runtime versions.

### Additional setup

Install IDEs through Toolbox and Rex from its [download page](https://www.superlogical.com/rex/docs/installation).
Keep work-specific installers and setup notes in the ignored `~/.bootstrap/` directory.

On a fresh machine, run `rustup default stable`. Use `tfenv install` and
`tfenv use` to select the Terraform version required by each project.
Changing a Brewfile does not uninstall existing apps.

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

`.config/yadm/bootstrap` and `check-tools` are launchers for the Go
program in `.config/yadm/setup`. Shell startup stays in zsh. Go setup invokes
tools with argument arrays; it does not build shell command strings.

```bash
go -C ~/.config/yadm/setup test ./...
go -C ~/.config/yadm/setup vet ./...
```

The Dotfiles workflow checks the Go program, shell launchers and package profiles,
and previews macOS preferences. Tests use temporary homes and fake command
runners to cover backups, power restrictions, repeat runs and local overrides.
Existing vim checkouts are kept; conflicting paths produce an error.

## macOS preferences

The [Go preferences command](.config/yadm/setup/macos.go) uses settings sampled from the main Mac on
2026-11-13: keyboard/text input, language and region, Finder, Dock, trackpads,
screenshots, Activity Monitor and Terminal. Check the results after macOS upgrades;
some keys are undocumented.

```bash
go -C ~/.config/yadm/setup run . macos                              # preview only
go -C ~/.config/yadm/setup run . macos --apply                      # apply shared preferences
go -C ~/.config/yadm/setup run . macos --profile mini --power       # preview shared + server power settings
go -C ~/.config/yadm/setup run . macos --profile mini --power --apply
```

The command uses the same yadm profile as the Brewfile. Both profiles share
preferences; `--power` is available only for the mini.

Before writing any preferences, all affected domains are backed up under the ignored
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
