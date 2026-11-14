package main

import (
	"bytes"
	"errors"
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
			if err := a.macos(profile, macOSOptions{power: profile == "mini"}); err != nil {
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
		if err := a.macos(test.profile, macOSOptions{apply: test.apply, power: true}); err == nil {
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
				return nil, errors.New("missing")
			}
			return nil, os.WriteFile(args[2], []byte("old preferences"), 0o600)
		}
		if name == "/usr/bin/defaults" && args[0] == "read" {
			return []byte("Domain does not exist"), errors.New("missing")
		}
		return []byte("macOS test"), nil
	}}
	a := app{home: t.TempDir(), out: io.Discard, runner: r}
	if err := a.macos("mini", macOSOptions{apply: true}); err != nil {
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
			// Fail the last domain, after the preceding backups have succeeded.
			if args[1] == "com.apple.Terminal" {
				return nil, errors.New("permission denied")
			}
			return nil, os.WriteFile(args[2], []byte("backup"), 0o600)
		}
		return []byte("existing domain"), nil
	}}
	a := app{home: t.TempDir(), out: io.Discard, runner: r}
	err := a.macos("mini", macOSOptions{apply: true})
	if err == nil || !strings.Contains(err.Error(), "com.apple.Terminal") {
		t.Fatalf("expected last-domain backup failure, got %v", err)
	}
	for _, call := range r.calls {
		if len(call) > 1 && call[1] == "write" {
			t.Fatal("wrote preferences before completing backups")
		}
	}
}

func TestRepoRerunAndConflict(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "existing")
	if err := os.MkdirAll(filepath.Join(dir, ".git"), 0o700); err != nil {
		t.Fatal(err)
	}
	r := &fakeRunner{output: func(string, ...string) ([]byte, error) { return []byte("https://example.test/config.git\n"), nil }}
	a := app{out: io.Discard, runner: r}
	if err := a.ensureRepo("https://example.test/config.git", dir); err != nil {
		t.Fatal(err)
	}
	if len(r.calls) != 1 {
		t.Fatal("rerun changed checkout")
	}
	if err := a.ensureRepo("https://example.test/other.git", dir); err == nil {
		t.Fatal("accepted unrelated checkout")
	}
	conflict := t.TempDir()
	if err := a.ensureRepo("https://example.test/config.git", conflict); err == nil {
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
	if err := os.WriteFile(custom, []byte("mine"), 0o600); err != nil {
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

func TestCopyIfAbsentPreservesLocalConfig(t *testing.T) {
	directory := t.TempDir()
	source, target := filepath.Join(directory, "source"), filepath.Join(directory, "target")
	if err := os.WriteFile(source, []byte("default"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := copyIfAbsent(source, target); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(target, []byte("custom"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.Remove(source); err != nil {
		t.Fatal(err)
	}
	if err := copyIfAbsent(source, target); err != nil {
		t.Fatal(err)
	}
	content, err := os.ReadFile(target)
	if err != nil || string(content) != "custom" {
		t.Fatalf("local config changed: %q (%v)", content, err)
	}
}

func TestPreferenceArgumentsDoNotMutateDefaults(t *testing.T) {
	pref := preference{domain: "example", key: "path", values: []string{"-string", "$HOME/Desktop/"}}
	first := pref.arguments("/first")
	first[3] = "changed"
	second := pref.arguments("/second")
	if second[3] != "-string" || second[4] != "/second/Desktop/" {
		t.Fatalf("defaults mutated: %v", second)
	}
}
