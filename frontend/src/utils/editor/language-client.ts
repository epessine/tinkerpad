import { Uri } from 'monaco-editor';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { CloseAction, ErrorAction } from 'vscode-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { useSettingsStore } from '../../stores/settings';

export const createLanguageClient = (dir: string) => {
    return new Promise(async (resolve: (value: MonacoLanguageClient) => void, reject) => {
        const [settingsStore] = useSettingsStore();
        const webSocket = new WebSocket(`ws://localhost:${settingsStore.app.autoCompletePort}/ls`);

        webSocket.onopen = async () => {
            const socket = toSocket(webSocket);
            const messageTransports = {
                reader: new WebSocketMessageReader(socket),
                writer: new WebSocketMessageWriter(socket),
            };

            const languageClient = new MonacoLanguageClient({
                id: '1',
                name: 'PHP Language Client',
                clientOptions: {
                    documentSelector: ['php'],
                    workspaceFolder: {
                        index: 1,
                        name: 'workspace-' + 1,
                        uri: Uri.file(dir),
                    },
                    errorHandler: {
                        error: () => ({ action: ErrorAction.Continue }),
                        closed: () => ({ action: CloseAction.DoNotRestart }),
                    },
                },
                connectionProvider: {
                    get: () => Promise.resolve(messageTransports),
                },
            });

            messageTransports.reader.onClose(async () => {
                await languageClient.stop();
            });

            try {
                await languageClient.start();
            } catch (e) {
                reject(e);
            }

            resolve(languageClient);
        };

        webSocket.onmessage = message => {
            console.log(message);
        };

        webSocket.onerror = error => {
            reject(error);
        };
    });
};
