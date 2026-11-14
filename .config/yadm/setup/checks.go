package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type toolCheck struct {
	label    string
	command  []string
	contains string
}

var toolChecks = []toolCheck{
	{label: "GitHub CLI", command: []string{"gh", "--version"}},
	{label: "Node.js", command: []string{"node", "--version"}},
	{label: "pnpm", command: []string{"pnpm", "--version"}},
	{label: "Python environment manager", command: []string{"uv", "--version"}},
	{label: "direnv", command: []string{"direnv", "version"}},
	{label: "fzf", command: []string{"fzf", "--version"}},
	{label: "ripgrep", command: []string{"rg", "--version"}},
	{label: "Codex CLI", command: []string{"codex", "--version"}},
	{label: "Git LFS", command: []string{"git", "lfs", "version"}},
	{label: "Docker CLI", command: []string{"docker", "--version"}},
	{label: "Docker Compose", command: []string{"docker", "compose", "version"}},
	{label: "JDK 21", command: []string{"java", "-version"}, contains: `version "21.`},
	{label: "Go", command: []string{"go", "version"}},
	{label: "1Password CLI", command: []string{"op", "--version"}},
	{label: "kubectl", command: []string{"kubectl", "version", "--client=true"}},
	{label: "Kubernetes OIDC plugin", command: []string{"kubectl", "oidc-login", "--version"}},
	{label: "Google Cloud CLI", command: []string{"gcloud", "version"}},
	{label: "GKE authentication plugin", command: []string{"gke-gcloud-auth-plugin", "--version"}},
	{label: "Claude Code", command: []string{"claude", "--version"}},
	{label: "AWS CLI", command: []string{"aws", "--version"}},
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
		ok := err == nil && strings.Contains(string(output), check.contains)
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
