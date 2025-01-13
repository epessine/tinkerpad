import * as monaco from 'monaco-editor';

export const setContextMenu = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const keepIds = [
        'editor.action.clipboardCutAction',
        'editor.action.clipboardCopyAction',
        'editor.action.clipboardPasteAction',
    ];
    const contextmenu = editor.getContribution('editor.contrib.contextmenu')! as any;
    const realMethod = contextmenu._getMenuActions;
    contextmenu._getMenuActions = function () {
        const items = realMethod.apply(contextmenu, arguments);
        return items.filter((i: any) => keepIds.includes(i.id));
    };
};
