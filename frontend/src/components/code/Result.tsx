import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import * as monaco from 'monaco-editor';
import { Tab } from '../../stores/code';
import { createEditor } from '../../utils/editor/create';
import { useGeneralStore } from '../../stores/general';

const Result: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    let editor: monaco.editor.IStandaloneCodeEditor;
    let container!: HTMLDivElement;

    onMount(async () => {
        const dir = props.tab.workingDir;
        const file = dir + `/result-${props.tab.id}.json`;

        editor = createEditor(container, file, props.tab, true);
    });

    createEffect(() => editor.setValue(props.tab.result!.outputs.map(v => v.raw).join('\n')));

    onCleanup(async () => editor?.dispose());

    return (
        <div
            class="h-full w-full"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
            ref={container}
        ></div>
    );
};

export default Result;
