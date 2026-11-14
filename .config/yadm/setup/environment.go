package main

import (
	"cmp"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func defaultProfile() string {
	if value := os.Getenv("YADM_PROFILE"); value != "" {
		return value
	}
	if value, err := exec.Command("yadm", "config", "--get", "local.class").Output(); err == nil {
		return cmp.Or(strings.TrimSpace(string(value)), "workstation")
	}
	return "workstation"
}

func executable(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir() && info.Mode()&0111 != 0
}

func setupPath(home string) {
	paths := []string{filepath.Join(home, ".local/bin"), filepath.Join(home, ".docker/bin"), "/opt/homebrew/bin", "/usr/local/bin"}
	for _, prefix := range []string{"/opt/homebrew", "/usr/local"} {
		java := filepath.Join(prefix, "opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
		if executable(filepath.Join(java, "bin/java")) {
			paths = append([]string{filepath.Join(java, "bin")}, paths...)
			if os.Getenv("JAVA_HOME") == "" {
				os.Setenv("JAVA_HOME", java)
			}
			break
		}
	}
	os.Setenv("PATH", strings.Join(paths, string(os.PathListSeparator))+string(os.PathListSeparator)+os.Getenv("PATH"))
}
