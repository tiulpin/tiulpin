for _dotfiles_prefix in /opt/homebrew /usr/local; do
  if [[ -x "$_dotfiles_prefix/bin/brew" ]]; then
    eval "$("$_dotfiles_prefix/bin/brew" shellenv zsh)"
    break
  fi
done
unset _dotfiles_prefix

typeset -U path
for _dotfiles_bin in "$HOME/.docker/bin" "$HOME/Library/Application Support/JetBrains/Toolbox/scripts"; do
  [[ ! -d "$_dotfiles_bin" ]] || path+=("$_dotfiles_bin")
done
unset _dotfiles_bin
