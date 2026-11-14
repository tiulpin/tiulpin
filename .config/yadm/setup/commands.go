package main

import (
	"fmt"
	"io"
	"os/exec"
	"strconv"
	"strings"
)

type runner interface {
	Run(input io.Reader, name string, args ...string) error
	Output(name string, args ...string) ([]byte, error)
}

type commands struct{ stdout, stderr io.Writer }

func (r commands) Run(input io.Reader, name string, args ...string) error {
	c := exec.Command(name, args...)
	c.Stdin, c.Stdout, c.Stderr = input, r.stdout, r.stderr
	return c.Run()
}

func (commands) Output(name string, args ...string) ([]byte, error) {
	return exec.Command(name, args...).CombinedOutput()
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
