# Dotfiles

- Setup code is in `setup/`. It is written in Go using only the standard library. Run `go test ./...` there.
- Brewfiles are in `brewfiles/`. Machine-specific config stays out of shared files.
- CI: `.github/workflows/dotfiles.yaml`.
