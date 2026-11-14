package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func repoRoot(t *testing.T) string {
	t.Helper()
	root, err := filepath.Abs("../../..")
	if err != nil {
		t.Fatal(err)
	}
	return root
}
func isolatedEnv(home string) []string {
	return []string{"HOME=" + home, "PATH=/usr/bin:/bin", "TERM=dumb", "GIT_CONFIG_NOSYSTEM=1"}
}
func TestFreshShellPreservesAgent(t *testing.T) {
	zsh, err := exec.LookPath("zsh")
	if err != nil {
		t.Skip("zsh unavailable")
	}
	home := t.TempDir()
	c := exec.Command(zsh, "-dfc", `source "$DOTFILES_ZSHRC"; [[ "$SSH_AUTH_SOCK" == /tmp/forwarded-agent ]] || exit 10; [[ "$PROMPT" == '%~ %# ' ]] || exit 11; print -r -- ready`)
	c.Env = append(isolatedEnv(home), "SSH_AUTH_SOCK=/tmp/forwarded-agent", "DOTFILES_ZSHRC="+filepath.Join(repoRoot(t), ".zshrc"))
	out, err := c.CombinedOutput()
	if err != nil || string(out) != "ready\n" {
		t.Fatalf("fresh shell: %s (%v)", out, err)
	}
}
func TestGitSigningIsLocal(t *testing.T) {
	git, err := exec.LookPath("git")
	if err != nil {
		t.Skip("git unavailable")
	}
	home := t.TempDir()
	config, err := os.ReadFile(filepath.Join(repoRoot(t), ".gitconfig"))
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(home, ".gitconfig")
	if err := os.WriteFile(path, config, 0600); err != nil {
		t.Fatal(err)
	}
	query := func(key string) (string, error) {
		c := exec.Command(git, "config", "--global", "--includes", "--get", key)
		c.Env = append(isolatedEnv(home), "GIT_CONFIG_GLOBAL="+path)
		out, err := c.CombinedOutput()
		return strings.TrimSpace(string(out)), err
	}
	if value, err := query("commit.gpgsign"); err == nil || value != "" {
		t.Fatalf("fresh host inherits signing: %q %v", value, err)
	}
	if err := os.WriteFile(filepath.Join(home, ".gitconfig.local"), []byte("[commit]\n gpgsign = true\n[user]\n signingkey = local-key\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if value, err := query("commit.gpgsign"); err != nil || value != "true" {
		t.Fatal(value, err)
	}
	if value, err := query("user.signingkey"); err != nil || value != "local-key" {
		t.Fatal(value, err)
	}
}
