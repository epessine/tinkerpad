import * as monaco from 'monaco-editor';
import { Tab } from '../../stores/code';

export const getSnippetModel = (tab: Tab): monaco.editor.ITextModel | null => {
    return monaco.editor.getModel(monaco.Uri.file(`${tab.workingDir}/snippet-${tab.id}.php`));
};
