import { Component, onCleanup, onMount } from 'solid-js';
import * as monaco from 'monaco-editor';
import { Tab } from '../../stores/code';
import { createEditor } from '../../utils/editor/create';
import { useGeneralStore } from '../../stores/general';
import { history } from '../../../wailsjs/go/models';

const Code: Component<{ log: history.HistoryLog }> = props => {
    const [generalStore] = useGeneralStore();
    let editor: monaco.editor.IStandaloneCodeEditor;
    let container!: HTMLDivElement;

    onMount(async () => {
        const file = props.log.workingDir + `/history-log-code-${props.log.uuid}.php`;
        const tab = {
            id: props.log.uuid,
            code: props.log.code,
            workingDir: props.log.workingDir,
        } as Tab;

        editor = createEditor(container, file, tab);

        monaco.editor.getModel(monaco.Uri.file(file))?.setValue(tab.code);

        editor.updateOptions({ readOnly: true, fontSize: 14.5, lineHeight: 1.4 });
    });

    onCleanup(async () => editor?.dispose());

    return (
        <div
            class="w-full h-full"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
            ref={container}
        ></div>
    );
};

export default Code;
