import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import * as monaco from 'monaco-editor';
import { createLanguageClient } from '../utils/editor/language-client';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { createEditor } from '../utils/editor/create';
import { Tab, useCodeStore } from '../stores/code';
import { useGeneralStore } from '../stores/general';

const Editor: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();
    let languageClient: MonacoLanguageClient;
    let editor: monaco.editor.IStandaloneCodeEditor;
    let container!: HTMLDivElement;

    onMount(async () => {
        const dir = props.tab.workingDir;
        const file = dir + `/snippet-${props.tab.id}.php`;

        editor = createEditor(container, file, props.tab);

        languageClient = await createLanguageClient(dir);
    });

    createEffect(async () => {
        const dir = props.tab.workingDir;

        if (languageClient?.isRunning()) {
            await languageClient.stop();
            await languageClient.dispose();
        }

        languageClient = await createLanguageClient(dir);
    });

    onCleanup(async () => {
        editor?.dispose();

        if (languageClient.isRunning()) {
            await languageClient.stop();
            await languageClient.dispose();
        }
    });

    return (
        <div
            classList={{
                'border-b':
                    codeStore.showResult &&
                    props.tab.result !== undefined &&
                    !codeStore.isHorizontalLayout,
                'border-r':
                    codeStore.showResult &&
                    props.tab.result !== undefined &&
                    codeStore.isHorizontalLayout,
            }}
            class="h-full w-full"
            style={{
                'background-color': generalStore.themeInfo.colors.background,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
            ref={container}
        ></div>
    );
};

export default Editor;
