package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const signingFingerprint = "25AD09288D162FCDFC7DE25E0E5CC7B47A2D1A2A"

func primaryFingerprint(data string) string {
	for line := range strings.SplitSeq(data, "\n") {
		parts := strings.Split(line, ":")
		if len(parts) > 9 && parts[0] == "fpr" {
			return parts[9]
		}
	}
	return ""
}

func (a *app) yubiKey() error {
	directory := filepath.Join(a.home, ".gnupg")
	if err := os.MkdirAll(directory, 0o700); err != nil {
		return err
	}
	if err := os.Chmod(directory, 0o700); err != nil {
		return err
	}
	key := filepath.Join(directory, "pubkey.asc")
	data, err := a.runner.Output("gpg", "--show-keys", "--with-colons", key)
	if err != nil {
		return err
	}
	if primaryFingerprint(string(data)) != signingFingerprint {
		return fmt.Errorf("tracked public key fingerprint does not match %s", signingFingerprint)
	}
	if err := a.run("gpg", "--import", key); err != nil {
		return err
	}
	if err := a.runner.Run(strings.NewReader(signingFingerprint+":6:\n"), "gpg", "--import-ownertrust"); err != nil {
		return err
	}
	if !a.confirm("Insert the YubiKey. Check the card now?") {
		return nil
	}
	if err := a.run("gpg", "--card-status"); err != nil {
		return err
	}
	if a.confirm("Enable GPG commit signing on this machine?") {
		for _, setting := range [][2]string{{"user.signingkey", signingFingerprint}, {"gpg.format", "openpgp"}, {"gpg.program", "gpg"}, {"commit.gpgsign", "true"}} {
			if err := a.run("git", "config", "--file", filepath.Join(a.home, ".gitconfig.local"), setting[0], setting[1]); err != nil {
				return err
			}
		}
	}
	fmt.Fprintln(a.out, "Choose the SSH agent in ~/.ssh/config.local. Existing agent settings were preserved.")
	return nil
}
