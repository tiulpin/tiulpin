package main

import (
	"bufio"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"runtime"
	"strings"
)

type app struct {
	home   string
	out    io.Writer
	input  *bufio.Reader
	runner runner
}

func validProfile(profile string) error {
	if profile != "workstation" && profile != "mini" {
		return fmt.Errorf("unknown profile %q; choose workstation or mini", profile)
	}
	return nil
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
	var options macOSOptions
	if command == "macos" {
		flags.BoolVar(&options.apply, "apply", false, "back up and write preferences; default is preview")
		flags.BoolVar(&options.power, "power", false, "mini only: prevent AC idle sleep and restart after power loss")
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
		return a.macos(*profile, options)
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
	a := app{
		home:   home,
		out:    os.Stdout,
		input:  bufio.NewReader(os.Stdin),
		runner: commands{stdout: os.Stdout, stderr: os.Stderr},
	}
	if err := a.execute(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
