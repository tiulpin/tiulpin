#!/bin/bash
osascript -e 'display notification "Git wants to sign a commit!" with title "Click on your Yubikey"'
/usr/local/opt/gnupg@2.2/bin/gpg --batch --no-tty "$@"
