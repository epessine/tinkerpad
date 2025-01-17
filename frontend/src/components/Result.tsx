import { Component, onCleanup, onMount } from 'solid-js';
import * as monaco from 'monaco-editor';
import { Tab } from '../stores/code';
import { createEditor } from '../utils/editor/create';
import { useGeneralStore } from '../stores/general';

const Result: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    let editor: monaco.editor.IStandaloneCodeEditor;
    let container!: HTMLDivElement;

    onMount(async () => {
        const dir = props.tab.workingDir;
        const file = dir + `/result-${props.tab.id}.json`;

        editor = createEditor(container, file, props.tab, true);
    });

    onCleanup(async () => editor?.dispose());

    return (
        <div
            class="grow"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
            ref={container}
        ></div>
    );
};

export default Result;
