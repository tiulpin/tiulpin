package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// Existing directories must be the intended Git checkout; never overwrite or update them.
func (a *app) ensureRepo(url, directory string) error {
	_, err := os.Lstat(directory)
	if errors.Is(err, fs.ErrNotExist) {
		return a.run("git", "clone", "--depth=1", url, directory)
	}
	if err != nil {
		return err
	}
	if _, err := os.Stat(filepath.Join(directory, ".git")); err != nil {
		return fmt.Errorf("%s exists but is not a Git checkout", directory)
	}
	origin, err := a.runner.Output("git", "-C", directory, "remote", "get-url", "origin")
	if err != nil {
		return err
	}
	if strings.TrimSuffix(strings.TrimSpace(string(origin)), ".git") != strings.TrimSuffix(url, ".git") {
		return fmt.Errorf("%s has a different origin; leaving it unchanged", directory)
	}
	return nil
}

func ensureLink(source, target string) error {
	if _, err := os.Lstat(target); err == nil {
		existing, err := os.Readlink(target)
		if err == nil {
			if !filepath.IsAbs(existing) {
				existing = filepath.Join(filepath.Dir(target), existing)
			}
			if filepath.Clean(existing) == filepath.Clean(source) {
				return nil
			}
		}
		return fmt.Errorf("%s already exists; leaving it unchanged", target)
	} else if !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(target), 0o700); err != nil {
		return err
	}
	return os.Symlink(source, target)
}

func (a *app) editors() error {
	vim := filepath.Join(a.home, ".vim_runtime")
	if err := a.ensureRepo("https://github.com/amix/vimrc.git", vim); err != nil {
		return err
	}
	vimrc := filepath.Join(a.home, ".vimrc")
	_, vimrcErr := os.Lstat(vimrc)
	if vimrcErr != nil && !errors.Is(vimrcErr, fs.ErrNotExist) {
		return vimrcErr
	}
	if errors.Is(vimrcErr, fs.ErrNotExist) {
		if err := a.run("sh", filepath.Join(vim, "install_awesome_vimrc.sh")); err != nil {
			return err
		}
	} else {
		fmt.Fprintln(a.out, "Keeping existing", vimrc)
	}
	return nil
}
