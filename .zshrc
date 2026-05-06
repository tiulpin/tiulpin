# Powerlevel10k instant prompt — keep at top
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

source $(brew --prefix)/share/antigen/antigen.zsh
antigen use oh-my-zsh
antigen bundle git
antigen bundle sudo
antigen bundle command-not-found
antigen bundle zsh-users/zsh-completions
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle wfxr/forgit
antigen theme romkatv/powerlevel10k
antigen apply

ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#141414'

path=(
  $HOME/.local/bin
  $HOME/.lmstudio/bin
  $(go env GOPATH)/bin
  $path
)
fpath=(
  $HOME/.zsh/completions
  $HOME/.local/share/zsh/site-functions
  $fpath
)

[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
eval "$(direnv hook zsh)"

export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
export GPG_TTY=$(tty)
export TEAMCITY_NO_UPDATE=1

alias peon="bash ~/.claude/hooks/peon-ping/peon.sh"
[ -f ~/.claude/hooks/peon-ping/completions.bash ] && source ~/.claude/hooks/peon-ping/completions.bash

# Push prompt to bottom of terminal on first prompt (Warp-style)
function _prompt_at_bottom() {
  printf '\n%.0s' {1..$LINES}
  precmd_functions=(${precmd_functions:#_prompt_at_bottom})
}
precmd_functions+=(_prompt_at_bottom)
