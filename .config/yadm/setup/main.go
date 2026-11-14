package main

import (
	"bufio"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
)

type runner interface {
	Run(input io.Reader, name string, args ...string) error
	Output(name string, args ...string) ([]byte, error)
}
type commands struct{}

func (commands) Run(input io.Reader, name string, args ...string) error {
	c := exec.Command(name, args...)
	c.Stdin, c.Stdout, c.Stderr = input, os.Stdout, os.Stderr
	return c.Run()
}
func (commands) Output(name string, args ...string) ([]byte, error) {
	return exec.Command(name, args...).CombinedOutput()
}

type app struct {
	home   string
	out    io.Writer
	input  *bufio.Reader
	runner runner
}

func (a *app) run(name string, args ...string) error {
	printCommand(a.out, name, args...)
	if err := a.runner.Run(a.input, name, args...); err != nil {
		return fmt.Errorf("%s: %w", name, err)
	}
	return nil
}
func printCommand(out io.Writer, name string, args ...string) {
	words := append([]string{name}, args...)
	for i, word := range words {
		if strings.ContainsAny(word, " \t\n\"'\\;|&$()<>") {
			words[i] = strconv.Quote(word)
		}
	}
	fmt.Fprintln(out, strings.Join(words, " "))
}
func (a *app) confirm(question string) bool {
	fmt.Fprintf(a.out, "%s [y/N] ", question)
	line, err := a.input.ReadString('\n')
	if err != nil {
		return false
	}
	answer := strings.ToLower(strings.TrimSpace(line))
	return answer == "y" || answer == "yes"
}
func validProfile(profile string) error {
	if profile != "workstation" && profile != "mini" {
		return fmt.Errorf("unknown profile %q; choose workstation or mini", profile)
	}
	return nil
}
func defaultProfile() string {
	if value := os.Getenv("YADM_PROFILE"); value != "" {
		return value
	}
	if value, err := exec.Command("yadm", "config", "--get", "local.class").Output(); err == nil {
		if value := strings.TrimSpace(string(value)); value != "" {
			return value
		}
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
func (a *app) execute(args []string) error {
	command := "bootstrap"
	if len(args) > 0 && !strings.HasPrefix(args[0], "-") {
		command, args = args[0], args[1:]
	}
	if len(args) > 0 && args[0] == "--check-tools" {
		command, args = "check-tools", args[1:]
	}
	flags := flag.NewFlagSet(command, flag.ContinueOnError)
	flags.SetOutput(a.out)
	profile := flags.String("profile", defaultProfile(), "workstation or mini (defaults to yadm local.class)")
	var apply, power bool
	if command == "macos" {
		flags.BoolVar(&apply, "apply", false, "back up and write preferences; default is preview")
		flags.BoolVar(&power, "power", false, "mini only: prevent AC idle sleep and restart after power loss")
	}
	if err := flags.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return nil
		}
		return err
	}
	if flags.NArg() != 0 {
		return fmt.Errorf("unexpected arguments: %v", flags.Args())
	}
	if err := validProfile(*profile); err != nil {
		return err
	}
	switch command {
	case "bootstrap":
		return a.bootstrap(*profile)
	case "check-tools":
		return a.checkTools(*profile)
	case "macos":
		if runtime.GOOS != "darwin" {
			return errors.New("macOS only")
		}
		if os.Geteuid() == 0 {
			return errors.New("run as your login user, not root")
		}
		return a.macos(*profile, apply, power)
	default:
		return fmt.Errorf("unknown command %q; use bootstrap, check-tools or macos", command)
	}
}
func main() {
	home, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	setupPath(home)
	a := app{home: home, out: os.Stdout, input: bufio.NewReader(os.Stdin), runner: commands{}}
	if err := a.execute(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
