/* @refresh reload */
import { render } from 'solid-js/web';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import './index.css';
import App from './App';
import { initServices } from 'monaco-languageclient/vscode/services';
import 'tippy.js/dist/tippy.css';
import './assets/sf-dump.js';
import './assets/sf-dump.css';

declare global {
    interface Window {
        Sfdump: (doc: string) => void;
    }
}

useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
        editorWorkerService: () =>
            new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
                type: 'module',
            }),
    },
});

await initServices({
    serviceConfig: {
        debugLogging: true,
    },
});

render(() => <App />, document.getElementById('root')!);
