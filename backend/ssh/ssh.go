package ssh

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
	"tinkerpad/backend/encrypt"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/storage"

	"github.com/google/uuid"
	"github.com/melbahja/goph"
	"golang.org/x/crypto/ssh"
	"golang.org/x/exp/slices"
)

type Ssh struct {
	log     *logger.Logger
	storage *storage.Storage
	Conns   []*SshConnection
}

type SshConnection struct {
	Uuid          string
	Client        *goph.Client
	Config        *SshConnectionConfig
	PhpRunnerPath string
}

func New() *Ssh {
	return &Ssh{}
}

func (s *Ssh) Boot(log *logger.Logger, storage *storage.Storage) {
	s.log = log
	s.storage = storage
}

func (s *Ssh) ConnExists(uuid string) bool {
	return slices.ContainsFunc(s.Conns, func(conn *SshConnection) bool {
		return conn.Uuid == uuid
	})
}

func (s *Ssh) RemoveConn(uuid string) {
	for i, conn := range s.Conns {
		if conn.Uuid == uuid {
			conn.Client.Close()
			s.Conns = slices.Delete(s.Conns, i, i+1)
			return
		}
	}
}

func (s *Ssh) createConnection(config SshConnectionConfig) (*SshConnection, error) {
	var auth goph.Auth
	var err error
	if config.AuthMethod == PrivateKey {
		pass, err := encrypt.Decrypt(config.Passphrase)
		if err != nil {
			return nil, err
		}
		auth, err = goph.Key(config.PrivateKey, pass)
		if err != nil {
			return nil, err
		}
	} else {
		pass, err := encrypt.Decrypt(config.Password)
		if err != nil {
			return nil, err
		}
		auth = goph.Password(pass)
	}

	client, err := goph.NewConn(&goph.Config{
		User:     config.Username,
		Addr:     config.Host,
		Port:     uint(config.Port),
		Auth:     auth,
		Timeout:  goph.DefaultTimeout,
		Callback: ssh.InsecureIgnoreHostKey(),
	})
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	errsChan := make(chan error, 1)
	phpRunnerPathChan := make(chan string, 1)

	wg.Add(3)

	go func() {
		defer wg.Done()
		path := "/tmp/tinkerpad-php.phar"
		out, err := client.Run(fmt.Sprintf("test -f \"%s\" && echo true || echo false", path))
		if err != nil || strings.TrimSpace(string(out)) == "false" {
			if err = client.Upload(s.storage.GetPath("resources", "bin", "php.phar"), path); err != nil {
				client.Close()
				select {
				case errsChan <- err:
				default:
					return
				}
			}
		}
		phpRunnerPathChan <- path
	}()

	go func() {
		defer wg.Done()
		out, err := client.Run(fmt.Sprintf("test -d \"%s\" && echo true || echo false", config.WorkingDir))
		if err != nil || strings.TrimSpace(string(out)) == "false" {
			if err == nil {
				err = errors.New("directory not found")
			}
			client.Close()
			select {
			case errsChan <- err:
			default:
			}
		}
	}()

	go func() {
		defer wg.Done()
		out, err := client.Run(fmt.Sprintf("%s -r \"echo phpversion() . PHP_EOL;\"", config.PhpBinaryPath))
		if err != nil || strings.Contains(string(out), config.PhpBinaryPath) {
			if err == nil {
				err = errors.New("php not found")
			}
			client.Close()
			select {
			case errsChan <- err:
			default:
			}
		}
	}()

	wg.Wait()
	select {
	case <-time.After(30 * time.Second):
		return nil, errors.New("operation timed out")
	case err := <-errsChan:
		return nil, err
	case phpRunnerPath := <-phpRunnerPathChan:
		return &SshConnection{
			Uuid:          uuid.NewString(),
			Client:        client,
			Config:        &config,
			PhpRunnerPath: phpRunnerPath,
		}, nil
	}
}

func (s *Ssh) CheckConnection(config SshConnectionConfig) (bool, error) {
	conn, err := s.createConnection(config)
	if err != nil {
		return false, err
	}
	conn.Client.Close()
	return true, nil
}

func (s *Ssh) Connect(config SshConnectionConfig) (string, error) {
	conn, err := s.createConnection(config)
	if err != nil {
		return "", err
	}

	s.Conns = append(s.Conns, conn)

	return conn.Uuid, nil
}
