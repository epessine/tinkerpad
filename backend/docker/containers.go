package docker

import (
	"encoding/json"
	"os/exec"
	"slices"
	"strings"
)

type ContainerInfo struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	WorkingDir    string `json:"workingDir"`
	PhpBinaryPath string `json:"phpBinaryPath"`
	PhpRunnerPath string `json:"phpRunnerPath"`
}

const filename = "containers.json"

func (d *Docker) GetAll() []ContainerInfo {
	infos := []ContainerInfo{}
	js, err := d.storage.Load(filename)
	if err == nil {
		if err = json.Unmarshal(js, &infos); err != nil {
			d.log.Errorf("failed to unmarshal docker containers: %v", err)
		}
	}
	for _, rc := range d.GetRunningContainers() {
		if slices.ContainsFunc(infos, func(i ContainerInfo) bool {
			return i.Id == rc.Id
		}) {
			continue
		}
		infos = append(infos, rc)
	}
	slices.SortFunc(infos, func(a, b ContainerInfo) int {
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	return infos
}

func (d *Docker) GetRunningContainers() []ContainerInfo {
	infos := []ContainerInfo{}
	res, err := exec.Command(d.settings.App.DockerBinaryPath, "ps", "--format", "{{.ID}}|{{.Names}}").Output()
	if err != nil {
		d.log.Errorf("error getting docker containers: %v", err)
		return infos
	}
	for _, c := range strings.Split(string(res), "\n") {
		v := strings.Split(c, "|")
		if len(v) != 2 {
			continue
		}
		infos = append(infos, ContainerInfo{
			Id:            v[0],
			Name:          v[1],
			WorkingDir:    "",
			PhpBinaryPath: "",
		})
	}
	return infos
}

func (d *Docker) Save(infos []ContainerInfo) error {
	js, err := json.Marshal(infos)
	if err != nil {
		return err
	}
	if err = d.storage.Store(js, filename); err != nil {
		return err
	}
	return nil
}
