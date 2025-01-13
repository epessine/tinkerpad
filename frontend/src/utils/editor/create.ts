import * as monaco from 'monaco-editor';
import { defineThemes } from './themes';
import { Tab, useCodeStore } from '../../stores/code';
import { useSettingsStore } from '../../stores/settings';
import { registerPHP } from './languages/php';
import { useGeneralStore } from '../../stores/general';
import { setContextMenu } from './context-menu';

export const createEditor = (
    container: HTMLElement,
    file: string,
    tab: Tab,
    result: boolean = false,
): monaco.editor.IStandaloneCodeEditor => {
    registerPHP();
    defineThemes();

    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();
    const [settingsStore] = useSettingsStore();

    const editor = monaco.editor.create(container, {
        readOnly: result,
        fontSize: settingsStore.app.editor.fontSize,
        fontFamily: settingsStore.app.editor.fontFamily,
        lineHeight: settingsStore.app.editor.lineHeight,
        lineNumbers: settingsStore.app.editor.lineNumbers ? 'on' : 'off',
        minimap: {
            enabled: false,
        },
        scrollbar: {
            horizontalScrollbarSize: 5,
            verticalScrollbarSize: 5,
        },
        wordWrap: settingsStore.app.editor.wordWrap ? 'on' : 'off',
        theme: generalStore.themeInfo.name,
        stickyScroll: {
            enabled: false,
        },
        automaticLayout: true,
        glyphMargin: false,
        scrollBeyondLastLine: false,
    });

    setContextMenu(editor);

    let editorModel = monaco.editor.getModel(monaco.Uri.file(file));

    if (editorModel === null) {
        const code = result ? tab.result! : tab.code;
        editorModel = monaco.editor.createModel(code, 'php', monaco.Uri.file(file));
    } else if (result) {
        editorModel.setValue(tab.result!);
    }

    editor.setModel(editorModel);

    if (result) {
        return editor;
    }

    editor.onDidChangeModelContent(() => {
        codeStore.setTabCode(tab.id, editor.getValue());
    });

    const lineCount = editorModel.getLineCount();

    editor.setPosition({
        lineNumber: lineCount,
        column: editorModel.getLineContent(lineCount).length + 1,
    });

    editor.focus();

    return editor;
};
