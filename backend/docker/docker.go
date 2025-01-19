package docker

import (
	"errors"
	"fmt"
	"os/exec"
	"strings"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/settings"
	"tinkerpad/backend/storage"
)

type Docker struct {
	log      *logger.Logger
	storage  *storage.Storage
	settings *settings.Settings
}

func New() *Docker {
	return &Docker{}
}

func (d *Docker) Boot(log *logger.Logger, storage *storage.Storage, settings *settings.Settings) {
	d.log = log
	d.storage = storage
	d.settings = settings
}

func (d *Docker) GetContainerInfoById(id string) *ContainerInfo {
	for _, i := range d.GetAll() {
		if i.Id == id {
			return &i
		}
	}
	return nil
}

func (d *Docker) ContainerIsRunning(id string) bool {
	res, err := exec.Command(d.settings.App.DockerBinaryPath, "ps", "--format", "\"{{.ID}}\"").Output()
	if err != nil {
		d.log.Errorf("error listing docker containers: %v", err)
		return false
	}
	for _, c := range strings.Split(string(res), "\n") {
		if strings.TrimSpace(c) == id {
			return true
		}
	}
	return false
}

func (d *Docker) GetContainerPhpBinaryPath(info ContainerInfo) (string, error) {
	res, err := exec.Command(d.settings.App.DockerBinaryPath, "exec", info.Id, "which", "php").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(res)), nil
}

func (d *Docker) GetContainerPhpVersion(info ContainerInfo) (string, error) {
	cmd := fmt.Sprintf("%s -r 'echo phpversion() . PHP_EOL;'", info.PhpBinaryPath)
	out, err := exec.Command(d.settings.App.DockerBinaryPath, "exec", info.Id, "sh", "-c", cmd).Output()
	if err != nil || strings.Contains(string(out), info.PhpBinaryPath) {
		if err == nil {
			err = errors.New("php not found")
		}
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

func (d *Docker) GetContainerWorkingDir(info ContainerInfo) (string, error) {
	cmd := "dirname \"$(find / -type f -name \"composer.json\" -print -quit 2>/dev/null)\""
	out, err := exec.Command(d.settings.App.DockerBinaryPath, "exec", info.Id, "sh", "-c", cmd).Output()
	if err != nil || strings.Contains(string(out), info.PhpBinaryPath) {
		if err == nil {
			err = errors.New("project dir not found")
		}
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

func (d *Docker) Connect(info ContainerInfo) (string, error) {
	_, err := d.GetContainerPhpVersion(info)
	if err != nil {
		return "", err
	}

	dirCmd := fmt.Sprintf("test -d '%s' && echo true || echo false", info.WorkingDir)
	out, err := exec.Command(d.settings.App.DockerBinaryPath, "exec", info.Id, "sh", "-c", dirCmd).Output()
	if err != nil || strings.TrimSpace(string(out)) == "false" {
		if err == nil {
			err = errors.New("directory not found")
		}
		return "", err
	}

	localPath := d.storage.GetPath("resources", "bin", "php.phar")
	remoteRunnerPath := fmt.Sprintf("/tmp/tinkerpad-php-%s.phar", d.settings.GetAppVersion())
	_, err = exec.Command(d.settings.App.DockerBinaryPath, "cp", localPath, fmt.Sprintf("%s:%s", info.Id, remoteRunnerPath)).Output()
	if err != nil {
		return "", err
	}

	return remoteRunnerPath, nil
}
