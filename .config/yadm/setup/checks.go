package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type toolCheck struct {
	label   string
	command []string
}

var toolChecks = []toolCheck{
	{"GitHub CLI", []string{"gh", "--version"}},
	{"Node.js", []string{"node", "--version"}},
	{"pnpm", []string{"pnpm", "--version"}},
	{"Python environment manager", []string{"uv", "--version"}},
	{"direnv", []string{"direnv", "version"}},
	{"fzf", []string{"fzf", "--version"}},
	{"ripgrep", []string{"rg", "--version"}},
	{"Codex CLI", []string{"codex", "--version"}},
	{"Git LFS", []string{"git", "lfs", "version"}},
	{"Docker CLI", []string{"docker", "--version"}},
	{"Docker Compose", []string{"docker", "compose", "version"}},
	{"JDK 21", []string{"java", "-version"}},
	{"Go", []string{"go", "version"}},
	{"1Password CLI", []string{"op", "--version"}},
	{"kubectl", []string{"kubectl", "version", "--client=true"}},
	{"Kubernetes OIDC plugin", []string{"kubectl", "oidc-login", "--version"}},
	{"Google Cloud CLI", []string{"gcloud", "version"}},
	{"GKE authentication plugin", []string{"gke-gcloud-auth-plugin", "--version"}},
	{"Claude Code", []string{"claude", "--version"}},
	{"AWS CLI", []string{"aws", "--version"}},
}

func (a *app) checkTools(profile string) error {
	failures := 0
	report := func(label string, ok bool) {
		if ok {
			fmt.Fprintln(a.out, "OK   ", label)
		} else {
			fmt.Fprintln(a.out, "FAIL ", label)
			failures++
		}
	}
	for _, check := range toolChecks {
		output, err := a.runner.Output(check.command[0], check.command[1:]...)
		ok := err == nil
		if check.label == "JDK 21" {
			ok = ok && strings.Contains(string(output), `version "21.`)
		}
		report(check.label, ok)
	}
	for _, name := range []string{"teamcity", "youtrack", "jcp", "airlock", "central", "space"} {
		_, err := exec.LookPath(name)
		report(name, err == nil)
	}
	if profile == "mini" {
		info, err := os.Stat("/Applications/OrbStack.app")
		report("OrbStack", err == nil && info.IsDir())
	}
	if failures > 0 {
		return fmt.Errorf("%d tool check(s) failed; install missing tools and reopen the terminal", failures)
	}
	fmt.Fprintln(a.out, "Tools available. Account sign-ins and cluster permissions are separate.")
	return nil
}
