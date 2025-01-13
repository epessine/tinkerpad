package php

import (
	"encoding/base64"
	"os/exec"
	"regexp"
	"strings"
	"tinkerpad/backend/docker"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/settings"
	"tinkerpad/backend/ssh"
	"tinkerpad/backend/storage"
)

type Php struct {
	log           *logger.Logger
	storage       *storage.Storage
	settings      *settings.Settings
	ssh           *ssh.Ssh
	docker        *docker.Docker
	phpRunnerPath string
}

func New() *Php {
	return &Php{}
}

func (php *Php) Boot(log *logger.Logger, storage *storage.Storage, settings *settings.Settings, ssh *ssh.Ssh, docker *docker.Docker) {
	php.log = log
	php.storage = storage
	php.settings = settings
	php.ssh = ssh
	php.docker = docker
	php.phpRunnerPath = php.storage.GetPath("resources", "bin", "php.phar")
}

func (php *Php) RunRemoteCode(uuid string, code string) string {
	var conn *ssh.SshConnection
	for _, c := range php.ssh.Conns {
		if c.Uuid == uuid {
			conn = c
		}
	}
	if conn == nil {
		return ""
	}

	value := cleanCode(code)

	cmd, err := conn.Client.Command(conn.Config.PhpBinaryPath, conn.PhpRunnerPath, conn.Config.WorkingDir, value)
	if err != nil {
		php.log.Errorf("error creating remote command: %v", err)
		return ""
	}

	result, _ := cmd.Output()

	php.log.Debugf("remote code result: %s", result)

	return cleanOutput(string(result))
}

func (php *Php) RunCode(cwd string, code string) string {
	value := cleanCode(code)
	cmd := exec.Command(php.settings.App.PhpBinaryPath, php.phpRunnerPath, cwd, value)

	php.log.Debugf("running php: %s", cmd.String())

	result, _ := cmd.Output()

	php.log.Debugf("code result: %s", result)

	return cleanOutput(string(result))
}

func (php *Php) RunDockerCode(id string, code string) string {
	info := php.docker.GetContainerInfoById(id)
	if info == nil {
		return ""
	}

	value := cleanCode(code)
	cmd := exec.Command(php.settings.App.DockerBinaryPath, "exec", info.Id, info.PhpBinaryPath, info.PhpRunnerPath, info.WorkingDir, value)

	php.log.Debugf("running php via docker: %s", cmd.String())

	result, _ := cmd.Output()

	php.log.Debugf("docker code result: %s", result)

	return cleanOutput(string(result))
}

func (php *Php) GetFrameworkInfo(cwd string) string {
	cmd := exec.Command(php.settings.App.PhpBinaryPath, php.phpRunnerPath, cwd)

	php.log.Debugf("running php: %s", cmd.String())

	result, _ := cmd.Output()

	php.log.Debugf("info result: %s", result)

	return string(result)
}

func (php *Php) GetRemoteFrameworkInfo(uuid string) string {
	var conn *ssh.SshConnection
	for _, c := range php.ssh.Conns {
		if c.Uuid == uuid {
			conn = c
		}
	}
	if conn == nil {
		return ""
	}

	cmd, _ := conn.Client.Command(conn.Config.PhpBinaryPath, conn.PhpRunnerPath, conn.Config.WorkingDir)

	result, _ := cmd.Output()

	return cleanOutput(string(result))
}

func (php *Php) GetDockerFrameworkInfo(id string) string {
	info := php.docker.GetContainerInfoById(id)
	if info == nil {
		return ""
	}

	result, _ := exec.Command(php.settings.App.DockerBinaryPath, "exec", info.Id, info.PhpBinaryPath, info.PhpRunnerPath, info.WorkingDir).Output()

	return cleanOutput(string(result))
}

func removePHPComments(code string) string {
	singleLine := regexp.MustCompile(`(?m)//.*$|#.*$`)
	multiLine := regexp.MustCompile(`(?s)/\*.*?\*/`)

	code = multiLine.ReplaceAllString(code, "")
	code = singleLine.ReplaceAllString(code, "")

	return code
}

func cleanOutput(output string) string {
	exit := regexp.MustCompile(`(?s)(<aside.*?<\/aside>)|Exit:  Ctrl\+D`)
	info := regexp.MustCompile(`(?s)(<whisper.*?<\/whisper>)|INFO  Ctrl\+D\.`)
	tabs := regexp.MustCompile(`(?m)^ {2}`)

	output = exit.ReplaceAllString(output, "")
	output = info.ReplaceAllString(output, "")
	output = tabs.ReplaceAllString(output, "")

	return strings.TrimPrefix(strings.TrimSpace(output), "> \n")
}

func cleanCode(code string) string {
	cleanedCode := removePHPComments(code)
	return base64.StdEncoding.EncodeToString([]byte(strings.TrimPrefix(cleanedCode, "<?php")))
}
