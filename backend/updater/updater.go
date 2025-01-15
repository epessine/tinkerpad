package updater

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strings"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/settings"

	"github.com/adrg/xdg"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/mod/semver"
)

type Updater struct {
	ctx      context.Context
	settings *settings.Settings
	log      *logger.Logger
}

type Release struct {
	Name   string  `json:"name"`
	Body   string  `json:"body"`
	Assets []Asset `json:"assets"`
}

type Asset struct {
	Name string `json:"name"`
	Url  string `json:"browser_download_url"`
}

type UpdateInfo struct {
	Version string `json:"version"`
	Body    string `json:"body"`
	Url     string `json:"url"`
}

func New() *Updater {
	return &Updater{}
}

func (u *Updater) Boot(ctx context.Context, s *settings.Settings, l *logger.Logger) {
	u.ctx = ctx
	u.settings = s
	u.log = l
}

func (u *Updater) CheckUpdate() {
	info := UpdateInfo{}
	res, err := http.Get("https://api.github.com/repos/epessine/tinkerpad/releases/latest")
	if err != nil || res.StatusCode != http.StatusOK {
		u.log.Errorf("error fetching latest release: %v", err)
		return
	}

	var r Release
	err = json.NewDecoder(res.Body).Decode(&r)
	if err != nil {
		u.log.Errorf("invalid release data: %v", err)
		return
	}

	v := semver.Compare(u.settings.GetAppVersion(), r.Name)
	if v >= 0 {
		return
	}

	var asset *Asset
	for _, a := range r.Assets {
		if strings.Contains(a.Name, ".dmg") {
			asset = &a
		}
	}
	if asset == nil {
		return
	}

	info.Version = r.Name
	info.Body = r.Body
	info.Url = asset.Url

	runtime.EventsEmit(u.ctx, "update-available", info)
}

func (u *Updater) DownloadUpdate(url string) error {
	res, err := http.Get(url)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	p := strings.Split(url, "/")
	path := path.Join(xdg.UserDirs.Download, p[len(p)-1])
	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, res.Body)
	if err != nil {
		return err
	}

	_, err = exec.Command("open", path).Output()
	return err
}
