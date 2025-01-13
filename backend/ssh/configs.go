package ssh

import (
	"encoding/json"
	"slices"
	"strings"
)

type SshConnectionConfig struct {
	Uuid          string     `json:"uuid"`
	Name          string     `json:"name"`
	GroupUuid     string     `json:"groupUuid"`
	Host          string     `json:"host"`
	Port          int        `json:"port"`
	Username      string     `json:"username"`
	WorkingDir    string     `json:"workingDir"`
	AuthMethod    AuthMethod `json:"authMethod"`
	PrivateKey    string     `json:"privateKey"`
	Passphrase    string     `json:"passphrase"`
	Password      string     `json:"password"`
	PhpBinaryPath string     `json:"phpBinaryPath"`
	Color         string     `json:"color"`
}

type SshConnectionConfigGroup struct {
	Uuid  string `json:"uuid"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

type Data struct {
	Configs []SshConnectionConfig      `json:"configs"`
	Groups  []SshConnectionConfigGroup `json:"groups"`
}

type AuthMethod string

const (
	PrivateKey AuthMethod = "key"
	Password   AuthMethod = "password"
)

var AuthMethods = []struct {
	Value  AuthMethod
	TSName string
}{
	{PrivateKey, "PrivateKey"},
	{Password, "Password"},
}

const filename = "ssh.json"

func (s *Ssh) GetAll() Data {
	data := Data{
		Configs: []SshConnectionConfig{},
		Groups:  []SshConnectionConfigGroup{},
	}
	js, err := s.storage.Load(filename)
	if err != nil {
		return data
	}
	if err = json.Unmarshal(js, &data); err != nil {
		s.log.Errorf("failed to unmarshal ssh connections: %v", err)
	}
	slices.SortFunc(data.Configs, func(a, b SshConnectionConfig) int {
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	slices.SortFunc(data.Groups, func(a, b SshConnectionConfigGroup) int {
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	return data
}

func (s *Ssh) Save(data Data) error {
	js, err := json.Marshal(data)
	if err != nil {
		return err
	}
	if err = s.storage.Store(js, filename); err != nil {
		return err
	}
	return nil
}
