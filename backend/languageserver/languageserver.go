package languageserver

import (
	"fmt"
	"io"
	"net/http"
	"os/exec"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/settings"
	"tinkerpad/backend/storage"

	"github.com/gorilla/websocket"
)

type LanguageServer struct {
	log      *logger.Logger
	storage  *storage.Storage
	settings *settings.Settings
	srv      *http.Server
}

type ServerProcess struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout io.ReadCloser
	stderr io.ReadCloser
}

func New() *LanguageServer {
	return &LanguageServer{}
}

func (ls *LanguageServer) Boot(log *logger.Logger, storage *storage.Storage, settings *settings.Settings) {
	ls.log = log
	ls.storage = storage
	ls.settings = settings
}

func (ls *LanguageServer) Start() {
	port := ls.settings.App.AutoCompletePort

	ls.srv = &http.Server{Addr: fmt.Sprintf(":%d", port)}

	http.HandleFunc("/ls", func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			ls.log.Errorf("Upgrade error: %v", err)
			return
		}

		proxy := ls.createProxy(conn)

		proxy.Run()
	})

	go ls.serve()

	for {
		if ls.settings.App.AutoCompletePort != port {
			port = ls.settings.App.AutoCompletePort
			ls.srv.Close()

			ls.srv = &http.Server{Addr: fmt.Sprintf(":%d", port)}
			go ls.serve()
		}
	}
}

func (ls *LanguageServer) Close() {
	if ls.srv != nil {
		ls.srv.Close()
	}
}

func (ls *LanguageServer) serve() {
	ls.log.Debugf("Starting proxy on :%s", ls.srv.Addr)

	if err := ls.srv.ListenAndServe(); err != http.ErrServerClosed {
		ls.log.Fatalf("ListenAndServe error: %v", err)
	}
}

func (ls *LanguageServer) createServerProcess() *ServerProcess {
	phpActorPath := ls.storage.GetPath("resources", "bin", "phpactor.phar")
	workDirFlag := fmt.Sprintf("--working-dir=%s", ls.storage.GetPath("resources"))

	cmd := exec.Command(ls.settings.App.PhpBinaryPath, phpActorPath, "language-server", workDirFlag)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		ls.log.Debugf("Failed to get stdin: %v", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		ls.log.Debugf("Failed to get stdout: %v", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		ls.log.Debugf("Failed to get stderr: %v", err)
	}

	return &ServerProcess{
		cmd:    cmd,
		stdin:  stdin,
		stdout: stdout,
		stderr: stderr,
	}
}

func (ls *LanguageServer) createProxy(websocket *websocket.Conn) *Proxy {
	return &Proxy{
		ls:        ls,
		websocket: websocket,
		server:    ls.createServerProcess(),
	}
}
