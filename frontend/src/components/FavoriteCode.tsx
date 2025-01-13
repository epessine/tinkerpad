import { Component, onCleanup, onMount } from 'solid-js';
import * as monaco from 'monaco-editor';
import { Tab } from '../stores/code';
import { createEditor } from '../utils/editor/create';
import { useGeneralStore } from '../stores/general';
import { favorites } from '../../wailsjs/go/models';

const FavoriteCode: Component<{
    tab?: Tab | undefined;
    favorite?: favorites.Favorite | undefined;
}> = props => {
    const [generalStore] = useGeneralStore();
    let editor: monaco.editor.IStandaloneCodeEditor;
    let container!: HTMLDivElement;

    onMount(async () => {
        const dir = props.tab?.workingDir ?? props.favorite?.workingDir;
        const file = dir + `/favorite-code-${props.tab?.id ?? props.favorite?.uuid}.php`;
        const tab =
            props.tab ??
            ({
                id: props.favorite!.uuid,
                code: props.favorite!.code,
                workingDir: props.favorite!.workingDir,
            } as Tab);

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

export default FavoriteCode;
