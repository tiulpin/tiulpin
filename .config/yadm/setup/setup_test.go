package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type fakeRunner struct {
	calls  [][]string
	output func(string, ...string) ([]byte, error)
}

func (f *fakeRunner) Run(_ io.Reader, name string, args ...string) error {
	f.calls = append(f.calls, append([]string{name}, args...))
	return nil
}
func (f *fakeRunner) Output(name string, args ...string) ([]byte, error) {
	f.calls = append(f.calls, append([]string{name}, args...))
	if f.output != nil {
		return f.output(name, args...)
	}
	return nil, nil
}
func TestMacOSPreviewDoesNotWrite(t *testing.T) {
	for _, profile := range []string{"mini", "workstation"} {
		t.Run(profile, func(t *testing.T) {
			home := t.TempDir()
			var out bytes.Buffer
			r := &fakeRunner{}
			a := app{home: home, out: &out, runner: r}
			if err := a.macos(profile, false, profile == "mini"); err != nil {
				t.Fatal(err)
			}
			if len(r.calls) != 0 {
				t.Fatal("preview executed commands", r.calls)
			}
			entries, err := os.ReadDir(home)
			if err != nil || len(entries) != 0 {
				t.Fatal("preview wrote files", entries, err)
			}
			if !strings.Contains(out.String(), home+"/Desktop/") {
				t.Fatal("home path not expanded")
			}
		})
	}
}
func TestPowerRejectsWorkstationAndBattery(t *testing.T) {
	for _, test := range []struct {
		profile string
		apply   bool
		output  string
	}{{"workstation", false, ""}, {"mini", true, "Now drawing from InternalBattery"}} {
		home := t.TempDir()
		r := &fakeRunner{output: func(string, ...string) ([]byte, error) { return []byte(test.output), nil }}
		a := app{home: home, out: io.Discard, runner: r}
		if err := a.macos(test.profile, test.apply, true); err == nil {
			t.Fatal("expected refusal")
		}
		for _, call := range r.calls {
			if call[0] == "sudo" || call[0] == "/usr/bin/defaults" {
				t.Fatal("wrote settings", call)
			}
		}
		entries, _ := os.ReadDir(home)
		if len(entries) != 0 {
			t.Fatal("created backup on refusal")
		}
	}
}
func TestPreferenceBackupOncePerDomain(t *testing.T) {
	r := &fakeRunner{output: func(name string, args ...string) ([]byte, error) {
		if name == "/usr/bin/defaults" && args[0] == "export" {
			if args[1] == "com.apple.Terminal" {
				return nil, fmt.Errorf("missing")
			}
			return nil, os.WriteFile(args[2], []byte("old preferences"), 0600)
		}
		if name == "/usr/bin/defaults" && args[0] == "read" {
			return []byte("Domain does not exist"), fmt.Errorf("missing")
		}
		return []byte("macOS test"), nil
	}}
	a := app{home: t.TempDir(), out: io.Discard, runner: r}
	if err := a.macos("mini", true, false); err != nil {
		t.Fatal(err)
	}
	exports := map[string]int{}
	writes := 0
	for _, call := range r.calls {
		if call[0] != "/usr/bin/defaults" {
			continue
		}
		if call[1] == "export" {
			exports[call[2]]++
			if exports[call[2]] != 1 {
				t.Fatal("duplicate export", call)
			}
		}
		if call[1] == "write" {
			writes++
			if exports[call[2]] != 1 {
				t.Fatal("write before backup", call)
			}
		}
	}
	if writes != len(preferences) {
		t.Fatalf("wrote %d preferences", writes)
	}
	markers, _ := filepath.Glob(filepath.Join(a.home, ".bootstrap/macos-*/com.apple.Terminal.absent"))
	if len(markers) != 1 {
		t.Fatal("missing absent marker")
	}
}
func TestBackupFailureStopsWrites(t *testing.T) {
	r := &fakeRunner{output: func(name string, args ...string) ([]byte, error) {
		if name == "/usr/bin/defaults" && args[0] == "export" {
			return nil, fmt.Errorf("permission denied")
		}
		return []byte("existing domain"), nil
	}}
	a := app{home: t.TempDir(), out: io.Discard, runner: r}
	if err := a.macos("mini", true, false); err == nil {
		t.Fatal("expected backup failure")
	}
	for _, call := range r.calls {
		if len(call) > 1 && call[1] == "write" {
			t.Fatal("wrote without backup")
		}
	}
}
func TestRepoRerunAndConflict(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "existing")
	if err := os.MkdirAll(filepath.Join(dir, ".git"), 0700); err != nil {
		t.Fatal(err)
	}
	r := &fakeRunner{output: func(string, ...string) ([]byte, error) { return []byte("https://example.test/config.git\n"), nil }}
	a := app{out: io.Discard, runner: r}
	fresh, err := a.ensureRepo("https://example.test/config.git", dir)
	if err != nil || fresh {
		t.Fatal(fresh, err)
	}
	if len(r.calls) != 1 {
		t.Fatal("rerun changed checkout")
	}
	if _, err := a.ensureRepo("https://example.test/other.git", dir); err == nil {
		t.Fatal("accepted unrelated checkout")
	}
	conflict := t.TempDir()
	if _, err := a.ensureRepo("https://example.test/config.git", conflict); err == nil {
		t.Fatal("accepted existing non-Git directory")
	}
}
func TestLinksPreserveUserFiles(t *testing.T) {
	dir := t.TempDir()
	source := filepath.Join(dir, "source")
	target := filepath.Join(dir, "link")
	if err := ensureLink(source, target); err != nil {
		t.Fatal(err)
	}
	if err := ensureLink(source, target); err != nil {
		t.Fatal("rerun", err)
	}
	if err := ensureLink("different", target); err == nil {
		t.Fatal("replaced link")
	}
	custom := filepath.Join(dir, "custom")
	if err := os.WriteFile(custom, []byte("mine"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := ensureLink(source, custom); err == nil {
		t.Fatal("replaced custom file")
	}
	data, _ := os.ReadFile(custom)
	if string(data) != "mine" {
		t.Fatal("custom file changed")
	}
}
func TestPrimaryFingerprint(t *testing.T) {
	data := "pub:-:2048:1:key::::::\nfpr:::::::::" + signingFingerprint + ":\nfpr:::::::::OTHER:"
	if got := primaryFingerprint(data); got != signingFingerprint {
		t.Fatal(got)
	}
	if primaryFingerprint("malformed") != "" {
		t.Fatal("accepted malformed key")
	}
}
