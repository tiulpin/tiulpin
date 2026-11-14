package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type macOSOptions struct {
	apply bool
	power bool
}

func (a *app) macos(profile string, options macOSOptions) error {
	if err := validProfile(profile); err != nil {
		return err
	}
	if options.power && profile != "mini" {
		return errors.New("--power requires --profile mini")
	}

	if options.apply {
		if options.power {
			if err := a.preparePowerSettings(); err != nil {
				return err
			}
		}
		backup, err := a.backupPreferences(options.power)
		if err != nil {
			return err
		}
		fmt.Fprintln(a.out, "Preference backup:", backup)
	} else {
		fmt.Fprintf(a.out, "Preview (%s): add --apply to write preferences.\n", profile)
	}

	execute := func(name string, args ...string) error {
		if options.apply {
			return a.run(name, args...)
		}
		printCommand(a.out, name, args...)
		return nil
	}
	for _, preference := range preferences {
		if err := execute("/usr/bin/defaults", preference.arguments(a.home)...); err != nil {
			return err
		}
	}
	if options.power {
		if err := execute("sudo", "/usr/bin/pmset", "-c", "sleep", "0", "displaysleep", "15", "autorestart", "1"); err != nil {
			return err
		}
	}
	if options.apply {
		fmt.Fprintln(a.out, "Preferences written. Reopen affected apps or log out to see changes.")
	} else {
		fmt.Fprintln(a.out, "Preview complete; no settings changed.")
	}
	return nil
}

func (a *app) preparePowerSettings() error {
	battery, err := a.runner.Output("/usr/bin/pmset", "-g", "batt")
	if err != nil {
		return fmt.Errorf("check battery: %w", err)
	}
	if strings.Contains(string(battery), "InternalBattery") {
		return errors.New("refusing mini power settings on a Mac with an internal battery")
	}
	return a.run("sudo", "-v")
}

func (a *app) backupPreferences(power bool) (string, error) {
	base := filepath.Join(a.home, ".bootstrap")
	if err := os.MkdirAll(base, 0o700); err != nil {
		return "", err
	}
	directory, err := os.MkdirTemp(base, "macos-")
	if err != nil {
		return "", err
	}

	if err := a.saveOutput(filepath.Join(directory, "macos-version.txt"), "/usr/bin/sw_vers"); err != nil {
		return "", err
	}
	if power {
		if err := a.saveOutput(filepath.Join(directory, "power-before.txt"), "/usr/bin/pmset", "-g", "custom"); err != nil {
			return "", err
		}
	}
	saved := make(map[string]bool)
	for _, preference := range preferences {
		if saved[preference.domain] {
			continue
		}
		if err := a.backupDomain(directory, preference.domain); err != nil {
			return "", err
		}
		saved[preference.domain] = true
	}
	return directory, nil
}

func (a *app) saveOutput(path, command string, args ...string) error {
	output, err := a.runner.Output(command, args...)
	if err != nil {
		return fmt.Errorf("capture %s: %w", command, err)
	}
	return os.WriteFile(path, output, 0o600)
}

func (a *app) backupDomain(directory, domain string) error {
	path := filepath.Join(directory, domain+".plist")
	_, exportErr := a.runner.Output("/usr/bin/defaults", "export", domain, path)
	if exportErr == nil {
		return os.Chmod(path, 0o600)
	}

	// An export failure is acceptable only when defaults confirms the domain is absent.
	output, readErr := a.runner.Output("/usr/bin/defaults", "read", domain)
	if readErr == nil || !strings.Contains(string(output), "does not exist") {
		return fmt.Errorf("back up %s: %w", domain, exportErr)
	}
	if err := os.Remove(path); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	return os.WriteFile(filepath.Join(directory, domain+".absent"), nil, 0o600)
}
