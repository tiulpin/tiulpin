# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

source $(brew --prefix)/share/antigen/antigen.zsh
antigen use oh-my-zsh

antigen bundle git
antigen bundle heroku
antigen bundle pip
antigen bundle lein
antigen bundle command-not-found
antigen bundle sudo

antigen bundle zsh-users/zsh-completions
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-autosuggestions

antigen bundle 'wfxr/forgit'
antigen theme romkatv/powerlevel10k

antigen apply

export LANG=en_US.UTF-8
export EDITOR='vim'
export PYENV_ROOT="$HOME/.pyenv"
export LDFLAGS="-L/usr/local/opt/openblas/lib -L/usr/local/opt/openssl/lib -L/usr/local/opt/ruby@2.6/lib"
export CPPFLAGS="-I/usr/local/opt/openblas/include -I/usr/local/opt/openssl/include -I/usr/local/opt/ruby@2.6/include"
export RUBY_CONFIGURE_OPTS="--with-openssl-dir=$(brew --prefix openssl@1.1)"
export PATH=$PATH:/Users/tv/.local/bin:\
$PYENV_ROOT/bin:\
$(go env GOPATH)/bin:\
$HOME/.poetry/bin:\
$HOME/.cargo/bin:\
/usr/local/opt/ruby@2.6/bin:\
/usr/local/sbin:\
/usr/local/opt/tcl-tk/bin:\
/usr/local/opt/gnupg@2.2/bin:\
/usr/local/opt/openssl@1.1/bin:\
/usr/local/opt/curl/bin

eval $(thefuck --alias)
eval "$(pyenv init --path)"
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
