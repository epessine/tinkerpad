package languageserver

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/textproto"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

type Proxy struct {
	ls        *LanguageServer
	websocket *websocket.Conn
	server    *ServerProcess
}

func (proxy *Proxy) Run() {
	var wg sync.WaitGroup

	wg.Add(3)

	if err := proxy.server.cmd.Start(); err != nil {
		proxy.ls.log.Errorf("Failed to start PHPActor: %v", err)
	}

	defer proxy.server.cmd.Process.Kill()
	defer proxy.websocket.Close()

	go func() {
		defer wg.Done()
		if err := proxy.websocketToServer(); err != nil {
			proxy.ls.log.Errorf("websocket to server error: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		if err := proxy.serverToWebsocket(); err != nil && err.Error() != "EOF" {
			proxy.ls.log.Errorf("server to websocket error: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		if err := proxy.logStdErr(); err != nil && err.Error() != "EOF" {
			proxy.ls.log.Errorf("error reading server stderr: %v", err)
		}
	}()

	wg.Wait()

	proxy.ls.log.Error("Proxy closed")
}

func (proxy *Proxy) websocketToServer() error {
	for {
		_, message, err := proxy.websocket.ReadMessage()
		if err != nil {
			return err
		}
		_, err = proxy.server.stdin.Write([]byte(fmt.Sprintf("Content-Length: %d\r\n\r\n%s", len(message), message)))
		if err != nil {
			return err
		}
	}
}

func (proxy *Proxy) serverToWebsocket() error {
	tpReader := textproto.NewReader(bufio.NewReader(proxy.server.stdout))
	for {
		headers, err := tpReader.ReadMIMEHeader()
		if err != nil {
			return err
		}

		contentLengthStr := headers.Get("Content-Length")
		if contentLengthStr == "" {
			return errors.New("Missing Content-Length header")
		}

		contentLength, err := strconv.Atoi(contentLengthStr)
		if err != nil {
			return err
		}

		body := make([]byte, contentLength)
		_, err = io.ReadFull(tpReader.R, body)
		if err != nil {
			return err
		}

		if !json.Valid(body) {
			return errors.New(fmt.Sprintf("Not valid json: %s", body))
		}

		if err = proxy.websocket.WriteMessage(websocket.TextMessage, body); err != nil {
			return err
		}
	}
}

func (proxy *Proxy) logStdErr() error {
	buf := make([]byte, 10*1024*1024)
	for {
		n, err := proxy.server.stderr.Read(buf)
		proxy.ls.log.Debugf("Stderr log: %d - %s", n, buf[:n])
		if err != nil {
			return err
		}
	}
}
