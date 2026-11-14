package main

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

func (a *app) bootstrap(profile string) error {
	if runtime.GOOS != "darwin" {
		return errors.New("macOS only")
	}
	if os.Geteuid() == 0 {
		return errors.New("run as your login user, not root")
	}
	if _, err := exec.LookPath("brew"); err != nil {
		return errors.New("install Homebrew and run brew install go yadm before bootstrap")
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
		if err := a.macos(profile, macOSOptions{}); err != nil {
			return err
		}
		if a.confirm("Apply these preferences?") {
			if err := a.macos(profile, macOSOptions{apply: true}); err != nil {
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
