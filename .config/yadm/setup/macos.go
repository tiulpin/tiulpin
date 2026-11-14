package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func (a *app) macos(profile string, apply, power bool) error {
	if err := validProfile(profile); err != nil {
		return err
	}
	if power && profile != "mini" {
		return fmt.Errorf("--power requires --profile mini")
	}
	if apply && power {
		battery, err := a.runner.Output("/usr/bin/pmset", "-g", "batt")
		if err != nil {
			return fmt.Errorf("check battery: %w", err)
		}
		if strings.Contains(string(battery), "InternalBattery") {
			return fmt.Errorf("refusing mini power settings on a Mac with an internal battery")
		}
		if err := a.run("sudo", "-v"); err != nil {
			return err
		}
	}
	backup := ""
	if apply {
		base := filepath.Join(a.home, ".bootstrap")
		if err := os.MkdirAll(base, 0700); err != nil {
			return err
		}
		var err error
		backup, err = os.MkdirTemp(base, "macos-")
		if err != nil {
			return err
		}
		version, err := a.runner.Output("/usr/bin/sw_vers")
		if err != nil {
			return err
		}
		if err = os.WriteFile(filepath.Join(backup, "macos-version.txt"), version, 0600); err != nil {
			return err
		}
		if power {
			before, err := a.runner.Output("/usr/bin/pmset", "-g", "custom")
			if err != nil {
				return err
			}
			if err = os.WriteFile(filepath.Join(backup, "power-before.txt"), before, 0600); err != nil {
				return err
			}
		}
		fmt.Fprintln(a.out, "Preference backup:", backup)
	} else {
		fmt.Fprintf(a.out, "Preview (%s): add --apply to write preferences.\n", profile)
	}
	saved := map[string]bool{}
	for _, pref := range preferences {
		args := append([]string(nil), pref...)
		for i := range args {
			args[i] = strings.ReplaceAll(args[i], "$HOME", a.home)
		}
		domain := args[0]
		if apply && !saved[domain] {
			target := filepath.Join(backup, domain+".plist")
			if _, err := a.runner.Output("/usr/bin/defaults", "export", domain, target); err != nil {
				// A failed export is safe to ignore only when the domain itself is absent.
				if result, readErr := a.runner.Output("/usr/bin/defaults", "read", domain); readErr == nil || !strings.Contains(string(result), "does not exist") {
					return fmt.Errorf("could not back up %s: %w", domain, err)
				}
				if err := os.Remove(target); err != nil && !os.IsNotExist(err) {
					return err
				}
				if err := os.WriteFile(filepath.Join(backup, domain+".absent"), nil, 0600); err != nil {
					return err
				}
			} else if err := os.Chmod(target, 0600); err != nil {
				return err
			}
			saved[domain] = true
		}
		args = append([]string{"write"}, args...)
		if apply {
			if err := a.run("/usr/bin/defaults", args...); err != nil {
				return err
			}
		} else {
			printCommand(a.out, "/usr/bin/defaults", args...)
		}
	}
	if power {
		args := []string{"/usr/bin/pmset", "-c", "sleep", "0", "displaysleep", "15", "autorestart", "1"}
		if apply {
			if err := a.run("sudo", args...); err != nil {
				return err
			}
		} else {
			printCommand(a.out, "sudo", args...)
		}
	}
	if apply {
		fmt.Fprintln(a.out, "Preferences written. Reopen affected apps or log out to see changes.")
	} else {
		fmt.Fprintln(a.out, "Preview complete; no settings changed.")
	}
	return nil
}
