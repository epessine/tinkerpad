package storage

import (
	"embed"
	"io/fs"
	"os"
	"path"
	"slices"

	"github.com/adrg/xdg"
)

type Storage struct {
	resources embed.FS
	Dir       string
}

var subDirs = []string{"logs", "store"}
var binaries = []string{"phpactor", "php"}

func New(resources embed.FS) *Storage {
	return &Storage{resources: resources, Dir: path.Join(xdg.ConfigHome, "Tinkerpad")}
}

func (storage *Storage) Boot() error {
	if err := ensureDirExists(storage.Dir); err != nil {
		return err
	}

	for _, subDir := range subDirs {
		if err := ensureDirExists(path.Join(storage.Dir, subDir)); err != nil {
			return err
		}
	}

	if err := storage.extractResources(); err != nil {
		return err
	}

	return nil
}

func (storage *Storage) GetPath(filename ...string) string {
	return path.Join(storage.Dir, path.Join(filename...))
}

func (storage *Storage) Load(filename ...string) ([]byte, error) {
	p := storage.GetPath(filename...)
	d, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	return d, err
}

func (storage *Storage) Open(filename ...string) (*os.File, error) {
	p := storage.GetPath(filename...)
	f, err := os.OpenFile(p, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0777)
	if err != nil {
		return nil, err
	}
	return f, err
}

func (storage *Storage) Store(data []byte, filename ...string) error {
	p := storage.GetPath(filename...)
	if err := os.WriteFile(p, data, 0777); err != nil {
		return err
	}
	return nil
}

func ensureDirExists(path string) error {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		if err = os.Mkdir(path, 0777); err != nil {
			return err
		}
	}
	return nil
}

func (storage *Storage) extractResources() error {
	if err := storage.extractDir("."); err != nil {
		return err
	}
	return nil
}

func (storage *Storage) extractDir(dir string) error {
	files, err := storage.resources.ReadDir(dir)
	if err != nil {
		return err
	}

	dirPath := storage.GetPath(dir)

	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		os.MkdirAll(dirPath, 0777)
	}

	for _, file := range files {
		if file.IsDir() {
			if err := storage.extractDir(path.Join(dir, file.Name())); err != nil {
				return err
			}
			continue
		}

		fileContent, err := storage.resources.ReadFile(path.Join(dir, file.Name()))
		if err != nil {
			return err
		}

		var permission fs.FileMode

		if slices.Contains(binaries, file.Name()) {
			permission = 0775
		} else {
			permission = os.ModePerm
		}

		if err := os.WriteFile(path.Join(dirPath, file.Name()), fileContent, permission); err != nil {
			return err
		}
	}

	return nil
}
