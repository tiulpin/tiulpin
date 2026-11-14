# Machine setup

Audited on 2026-11-13 using Homebrew installed-on-request records, cask metadata,
`mas list`, Applications folders and CLI locations on the workstation, and a
read-only Rex inventory on the mini. These manifests describe desired packages;
they do not install anything until bootstrap or `brew bundle install` is run.

## Package profiles

- `brewfiles/common`: shared shell tools, Git/LFS/GitHub CLI, Node/pnpm, uv,
  text/JSON/YAML tools, Neovim, and the Codex CLI.
- `brewfiles/workstation`: common plus the installed workstation formulae,
  GUI applications and App Store applications.
- `brewfiles/mini`: common plus OrbStack and Claude Code CLI. No App Store
  applications, Docker Desktop, local Kubernetes clusters, cloud credentials,
  GUI AI clients, media apps or YubiKey setup.

```bash
yadm config local.class workstation  # this machine; use mini on the mini
brew bundle list --all --file="$HOME/Brewfile"
brew bundle check --no-upgrade --file="$HOME/Brewfile"
yadm bootstrap
```

Inspect a profile without changing this machine's class:

```bash
brew bundle list --all --file="$HOME/.config/yadm/brewfiles/mini"
# Installing is a separate, explicit step on the intended machine:
brew bundle install --no-upgrade --file="$HOME/.config/yadm/brewfiles/mini"
```

`~/Brewfile` is a dispatcher. Unknown profiles fail instead of installing the
workstation suite. The common file is evaluated within each profile, so dependency
checks see a complete manifest. Bootstrap uses the same class for packages and
checks, previews macOS preferences, and skips YubiKey setup on the mini. It does
not automatically start Docker/OrbStack or authenticate accounts.

Do not overwrite the dispatcher with `brew bundle dump --force`. Capture a
separate inventory and compare it instead:

```bash
brew bundle dump --file=/tmp/Brewfile.installed --force
```

Avoid `brew bundle cleanup --force`: profiles omit some vendor-managed tools and
this audit is not authorization to uninstall software. Package versions are not
locked; use project runtime managers or containers for version-specific builds.

## Workstation audit findings

Added installed formulae missing from the old manifest: DuckDB, Fastfetch, k9s,
Junie, Maven, mcp-grafana, pnpm, Poppler, Python 3.14 and YouTrack CLI. Normalized
`homebrew/core/kubelogin` to its current `kubelogin` name.

Added installed casks: Finicky, Google Gemini, incident.io, Steam, Tailscale,
Transmission and Yeti Alpha. Added App Store entries for MoneyWiz, TestFlight and
Xcode, using IDs returned by `mas list`.

Removed Notion Calendar from the desired list because neither its cask nor app
was installed. Removed `codex-app`: installed Homebrew metadata marks it deprecated
and replaced by `chatgpt`, which is already included. No apps were uninstalled.

Added missing shell dependencies `direnv` and `fzf`, and made `ripgrep` explicit
(the first `rg` on PATH was inside an agent's versioned directory). Node is now explicit
rather than an indirect dependency. The installed Node is 26.12.0, while tracked
`.node-version` and `.tool-versions` specify 22 and 24 respectively; resolving
project pins remains separate. Python 3.13 is installed but marked as a dependency,
not an explicit request; it is not pinned in this manifest. Python 3.14 is explicit.

Kept package-specific third-party trust declarations from the existing installed
inventory; narrowed Junie's tap-wide trust to its formula. Omitted unused installed
taps (anchore/syft, go-task/tap, int128/kubelogin) from the desired list; the installed
syft/kubelogin formulae resolve from Homebrew core. Existing taps remain installed.

`npm ls -g` showed only npm itself; `uv tool list` showed no installed tools.
Package dependencies are intentionally not all pinned as top-level entries.

## Vendor-managed applications and CLIs

These were found outside Homebrew/App Store management. Keep their original
installation/update mechanisms; no unverified cask names were invented.

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

Safari and system Utilities come with macOS. App Store IDs for Keynote/Numbers/
Pages are preserved despite their installed `Creator Studio` bundle names.
Do not copy credentials, caches, or login state as part of app restoration.

## Mini audit and remaining setup

Observed installed: Homebrew, Command Line Tools, `gh`, OrbStack and Rex Beta.
GarageBand, iMovie, Keynote, Numbers and Pages were also present, but are not
requirements for the mini profile and were left untouched. The standalone
Tailscale app was not present in the mini's Applications listing; Rex's built-in
Tailscale connection already works. A system Tailscale app is optional for access
to services beyond Rex, not silently added by this profile.

Launch OrbStack once, then check `docker info` and `docker compose version`.
Compose comes from OrbStack on the mini; no Docker Desktop symlink is installed.
Home Assistant/Pi-hole deployment files, persistent volumes and backups should
be managed separately from package installation.

Before porting the rest of the dotfiles, address these existing assumptions:

- `.zshrc` invokes Go and GPG unconditionally; the mini profile deliberately omits
  both. Guard optional tooling before deploying that shell configuration.
- `.gitconfig` requires the workstation's GPG signing key; configure mini signing
  before committing there. Do not silently disable signing.
- `.ssh/config` points at the workstation's GPG agent. Rex over Tailscale does not
  require copying that agent configuration to the mini.
- Agent skills/settings and Rex settings are not currently tracked by this yadm
  repo. Review portable configuration separately from credentials.

## macOS preferences

The script now lives at `~/.config/yadm/macos`, alongside bootstrap and tool checks.

```bash
bash ~/.config/yadm/macos --profile mini --power          # preview
bash ~/.config/yadm/macos --profile mini --power --apply  # apply on mini
```

Existing references in bootstrap and CONTRIBUTING.md use this location. The old
`~/.macos` file is removed; invoking it is not part of setup anymore. Applying is
still explicit and makes local preference backups under `~/.bootstrap/`.
