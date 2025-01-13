package settings

import (
	"encoding/json"
	"os/exec"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/storage"
)

const filename = "settings.json"

type App struct {
	PhpBinaryPath     string `json:"phpBinaryPath"`
	DockerBinaryPath  string `json:"dockerBinaryPath"`
	AutoCompletePort  int    `json:"autoCompletePort"`
	DefaultWorkingDir string `json:"defaultWorkingDir"`
	Editor            Editor `json:"editor"`
}

type Editor struct {
	FontSize    int     `json:"fontSize"`
	LineHeight  float32 `json:"lineHeight"`
	FontFamily  string  `json:"fontFamily"`
	WordWrap    bool    `json:"wordWrap"`
	LineNumbers bool    `json:"lineNumbers"`
}

type Settings struct {
	appVersion string
	log        *logger.Logger
	storage    *storage.Storage
	App        *App
}

func New(v string) *Settings {
	return &Settings{
		appVersion: v,
	}
}

func (settings *Settings) Boot(log *logger.Logger, storage *storage.Storage) {
	settings.log = log
	settings.storage = storage

	app, err := settings.storage.Load(filename)
	if err != nil {
		settings.App = settings.defaults()
	}
	if err = json.Unmarshal(app, &settings.App); err != nil {
		log.Errorf("failed to unmarshal config: %v", err)
	}
}

func (settings *Settings) RestoreDefaults() (err error) {
	if err = settings.Save(settings.defaults()); err != nil {
		return err
	}
	return nil
}

func (settings *Settings) defaults() *App {
	phpBinary, err := exec.LookPath("php")
	if err != nil {
		phpBinary = "php"
	}

	dockerBinary, err := exec.LookPath("docker")
	if err != nil {
		dockerBinary = "docker"
	}

	a := &App{
		PhpBinaryPath:     phpBinary,
		DockerBinaryPath:  dockerBinary,
		AutoCompletePort:  3044,
		DefaultWorkingDir: settings.storage.GetPath("resources", "sandbox"),
		Editor: Editor{
			FontSize:   14,
			LineHeight: 1.5,
			FontFamily: "Zed Mono Extended",
			WordWrap:   true,
		},
	}

	return a
}

func (settings *Settings) IsValidPhpBinaryPath(path string) bool {
	_, err := exec.Command(path, "-v").Output()
	return err == nil
}

func (settings *Settings) IsValidDockerBinaryPath(path string) bool {
	_, err := exec.Command(path, "ps").Output()
	return err == nil
}

func (settings *Settings) GetData() *App {
	return settings.App
}

func (settings *Settings) Save(data *App) error {
	settings.App = data
	settingsData, err := json.Marshal(settings.App)
	if err != nil {
		return err
	}
	if err = settings.storage.Store(settingsData, filename); err != nil {
		return err
	}
	return nil
}
