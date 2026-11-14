typeset -U path fpath
path=("$HOME/.local/bin" $path)
[[ ! -d "$HOME/.lmstudio/bin" ]] || path=("$HOME/.lmstudio/bin" $path)
if (( $+commands[go] )); then
  _dotfiles_gopath=$(go env GOPATH 2>/dev/null)
  [[ -z "$_dotfiles_gopath" ]] || path=("$_dotfiles_gopath/bin" $path)
  unset _dotfiles_gopath
fi
fpath=("$HOME/.zsh/completions" "$HOME/.local/share/zsh/site-functions" $fpath)
[[ ! -d "$HOME/.docker/completions" ]] || fpath=("$HOME/.docker/completions" $fpath)

if (( $+commands[brew] )); then
  _dotfiles_brew_prefix=$(brew --prefix 2>/dev/null)
  if [[ -r "$_dotfiles_brew_prefix/share/antigen/antigen.zsh" ]]; then
    source "$_dotfiles_brew_prefix/share/antigen/antigen.zsh"
    antigen use oh-my-zsh
    antigen bundle git
    antigen bundle sudo
    antigen bundle command-not-found
    antigen bundle zsh-users/zsh-completions
    antigen bundle zsh-users/zsh-syntax-highlighting
    antigen bundle zsh-users/zsh-autosuggestions
    antigen bundle wfxr/forgit
    antigen apply
  fi
  if [[ -d "$_dotfiles_brew_prefix/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]]; then
    export JAVA_HOME="$_dotfiles_brew_prefix/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
    path=("$JAVA_HOME/bin" $path)
  fi
  unset _dotfiles_brew_prefix
fi

autoload -Uz compinit
(( $+functions[compdef] )) || compinit
PROMPT='%~ %# '
RPROMPT=''
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#141414'

if (( $+commands[direnv] )); then
  eval "$(direnv hook zsh)"
fi
# Preserve SSH_AUTH_SOCK from the login session or forwarded agent.
if [[ -t 0 ]]; then
  export GPG_TTY=$(tty)
fi
export TEAMCITY_NO_UPDATE=1
export SPACE_CREDENTIAL_STORE=keychain

if [[ -f "$HOME/.claude/hooks/peon-ping/peon.sh" ]]; then
  alias peon='bash "$HOME/.claude/hooks/peon-ping/peon.sh"'
fi
[[ ! -f "$HOME/.claude/hooks/peon-ping/completions.bash" ]] || source "$HOME/.claude/hooks/peon-ping/completions.bash"

# Local overrides may select an agent or add machine-specific paths.
[[ ! -r "$HOME/.zshrc.local" ]] || source "$HOME/.zshrc.local"
