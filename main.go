package main

import (
	"context"
	"embed"
	"fmt"
	golog "log"
	"time"
	"tinkerpad/backend/dialog"
	"tinkerpad/backend/docker"
	"tinkerpad/backend/favorites"
	"tinkerpad/backend/history"
	"tinkerpad/backend/languageserver"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/php"
	"tinkerpad/backend/settings"
	"tinkerpad/backend/ssh"
	"tinkerpad/backend/storage"
	"tinkerpad/backend/store"
	"tinkerpad/backend/updater"

	"github.com/haroldadmin/pathfix"
	"github.com/wailsapp/wails/v2"
	wlogger "github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var version = "dev"

//go:embed frontend/dist
var assets embed.FS

//go:embed all:resources
var resources embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	if err := pathfix.Fix(); err != nil {
		golog.Printf("error copying path variables: %v", err)
	}

	stg := storage.New(resources)
	log := logger.New()
	sg := settings.New(version)
	ls := languageserver.New()
	st := store.New()
	php := php.New()
	d := dialog.New()
	f := favorites.New()
	h := history.New()
	sh := ssh.New()
	dk := docker.New()
	u := updater.New()

	if err := stg.Boot(); err != nil {
		golog.Fatalf("error on storage boot: %v", err)
	}

	logFile := stg.GetPath("logs", fmt.Sprintf("%s-%s.log", "tinkerpad-log", time.Now().Format("2006-01-02")))

	err := wails.Run(&options.App{
		Title:             "Tinkerpad",
		Width:             1024,
		Height:            768,
		MinWidth:          1024,
		MinHeight:         768,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: true,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		Assets:            assets,
		Menu:              nil,
		Logger:            wlogger.NewFileLogger(logFile),
		LogLevel:          wlogger.DEBUG,
		OnStartup: func(ctx context.Context) {
			log.Boot(ctx)
			sg.Boot(log, stg)
			d.Boot(ctx, log, sg)
			st.Boot(log, stg)
			ls.Boot(log, stg, sg)
			sh.Boot(log, stg, sg)
			dk.Boot(log, stg, sg)
			php.Boot(log, stg, sg, sh, dk)
			f.Boot(log, stg)
			h.Boot(log, stg)
			u.Boot(ctx, sg, log)

			if window, err := st.GetWindowStats(); err == nil && window != (store.WindowStats{}) {
				runtime.WindowSetSize(ctx, window.Width, window.Height)
				runtime.WindowSetPosition(ctx, window.X, window.Y)
			}

			go ls.Start()

			go func() {
				for range time.Tick(8 * time.Hour) {
					u.CheckUpdate()
				}
			}()
		},
		OnShutdown: func(ctx context.Context) {
			for _, conn := range sh.Conns {
				conn.Client.Close()
			}
			ls.Close()
		},
		WindowStartState: options.Normal,
		Bind: []interface{}{
			sg,
			st,
			php,
			d,
			f,
			h,
			sh,
			dk,
			u,
		},
		EnumBind: []interface{}{
			store.Stores,
			ssh.AuthMethods,
		},
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 true,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.DefaultAppearance,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "Tinkerpad",
				Message: "",
				Icon:    icon,
			},
		},
	})

	if err != nil {
		golog.Fatal(err)
	}
}
