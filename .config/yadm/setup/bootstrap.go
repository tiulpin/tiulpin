package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

func (a *app) bootstrap(profile string) error {
	if runtime.GOOS != "darwin" {
		return fmt.Errorf("macOS only")
	}
	if os.Geteuid() == 0 {
		return fmt.Errorf("run as your login user, not root")
	}
	if _, err := exec.LookPath("brew"); err != nil {
		return fmt.Errorf("install Homebrew and run brew install go yadm before bootstrap")
	}
	brewfile := filepath.Join(a.home, ".config/yadm/brewfiles", profile)
	if _, err := os.Stat(brewfile); err != nil {
		return err
	}
	if a.confirm("Install " + profile + " packages?") {
		if err := a.run("brew", "bundle", "install", "--file="+brewfile, "--no-upgrade"); err != nil {
			return err
		}
	}
	var checkErr error
	if a.confirm("Configure CLI integrations and check tools?") {
		if err := a.integrations(profile); err != nil {
			return err
		}
		checkErr = a.checkTools(profile)
	}
	if a.confirm("Review macOS preferences?") {
		if err := a.macos(profile, false, false); err != nil {
			return err
		}
		if a.confirm("Apply these preferences?") {
			if err := a.macos(profile, true, false); err != nil {
				return err
			}
		}
	}
	if a.confirm("Install tmux and vim configurations?") {
		if err := a.editors(); err != nil {
			return err
		}
	}
	if profile == "workstation" && a.confirm("Set up the YubiKey GPG key?") {
		if err := a.yubiKey(); err != nil {
			return err
		}
	}
	if profile == "workstation" && a.confirm("Switch yadm origin to SSH?") {
		if err := a.run("yadm", "remote", "set-url", "origin", "git@github.com:tiulpin/tiulpin.git"); err != nil {
			return err
		}
	}
	if checkErr != nil {
		return checkErr
	}
	fmt.Fprintln(a.out, "Selected steps completed. Open a new terminal and complete host-specific sign-ins.")
	return nil
}
func (a *app) integrations(profile string) error {
	if err := a.run("git", "lfs", "install", "--skip-repo"); err != nil {
		return err
	}
	if _, err := exec.LookPath("gcloud"); err == nil {
		if err := a.run("gcloud", "components", "install", "gke-gcloud-auth-plugin", "--quiet"); err != nil {
			return err
		}
		root, err := a.runner.Output("gcloud", "info", "--format=value(installation.sdk_root)")
		if err != nil {
			return err
		}
		source := filepath.Join(strings.TrimSpace(string(root)), "bin/gke-gcloud-auth-plugin")
		if !executable(source) {
			return fmt.Errorf("GKE plugin missing at %s", source)
		}
		if err := ensureLink(source, filepath.Join(a.home, ".local/bin/gke-gcloud-auth-plugin")); err != nil {
			return err
		}
	}
	compose := "/Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose"
	if profile == "workstation" && executable(compose) {
		return ensureLink(compose, filepath.Join(a.home, ".docker/cli-plugins/docker-compose"))
	}
	return nil
}

// Existing directories must be the intended Git checkout; never overwrite or update them.
func (a *app) ensureRepo(url, directory string) (bool, error) {
	if _, err := os.Lstat(directory); err == nil {
		if _, err := os.Stat(filepath.Join(directory, ".git")); err != nil {
			return false, fmt.Errorf("%s exists but is not a Git checkout", directory)
		}
		origin, err := a.runner.Output("git", "-C", directory, "remote", "get-url", "origin")
		if err != nil {
			return false, err
		}
		if strings.TrimSuffix(strings.TrimSpace(string(origin)), ".git") != strings.TrimSuffix(url, ".git") {
			return false, fmt.Errorf("%s has a different origin; leaving it unchanged", directory)
		}
		return false, nil
	} else if !os.IsNotExist(err) {
		return false, err
	}
	return true, a.run("git", "clone", "--depth=1", url, directory)
}
func ensureLink(source, target string) error {
	if _, err := os.Lstat(target); err == nil {
		existing, err := os.Readlink(target)
		if err == nil {
			if !filepath.IsAbs(existing) {
				existing = filepath.Join(filepath.Dir(target), existing)
			}
			if filepath.Clean(existing) == filepath.Clean(source) {
				return nil
			}
		}
		return fmt.Errorf("%s already exists; leaving it unchanged", target)
	} else if !os.IsNotExist(err) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(target), 0700); err != nil {
		return err
	}
	return os.Symlink(source, target)
}
func (a *app) editors() error {
	vim := filepath.Join(a.home, ".vim_runtime")
	_, err := a.ensureRepo("https://github.com/amix/vimrc.git", vim)
	if err != nil {
		return err
	}
	vimrc := filepath.Join(a.home, ".vimrc")
	_, vimrcErr := os.Lstat(vimrc)
	if vimrcErr != nil && !os.IsNotExist(vimrcErr) {
		return vimrcErr
	}
	if os.IsNotExist(vimrcErr) {
		if err := a.run("sh", filepath.Join(vim, "install_awesome_vimrc.sh")); err != nil {
			return err
		}
	} else {
		fmt.Fprintln(a.out, "Keeping existing", vimrc)
	}
	tmux := filepath.Join(a.home, ".tmux")
	if _, err := a.ensureRepo("https://github.com/gpakosz/.tmux.git", tmux); err != nil {
		return err
	}
	if err := ensureLink(filepath.Join(tmux, ".tmux.conf"), filepath.Join(a.home, ".tmux.conf")); err != nil {
		return err
	}
	target := filepath.Join(a.home, ".tmux.conf.local")
	if _, err := os.Lstat(target); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return err
	}
	content, err := os.ReadFile(filepath.Join(tmux, ".tmux.conf.local"))
	if err != nil {
		return err
	}
	return os.WriteFile(target, content, 0600)
}

const signingFingerprint = "25AD09288D162FCDFC7DE25E0E5CC7B47A2D1A2A"

func primaryFingerprint(data string) string {
	for _, line := range strings.Split(data, "\n") {
		parts := strings.Split(line, ":")
		if len(parts) > 9 && parts[0] == "fpr" {
			return parts[9]
		}
	}
	return ""
}
func (a *app) yubiKey() error {
	directory := filepath.Join(a.home, ".gnupg")
	if err := os.MkdirAll(directory, 0700); err != nil {
		return err
	}
	if err := os.Chmod(directory, 0700); err != nil {
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
