import { Component } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import FolderCode from '../../icons/FolderCode';
import { SelectDir } from '../../../../wailsjs/go/dialog/Dialog';
import { createTooltip } from '../../../utils/tooltip/create';

const WorkingDirButton: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    const setWorkingDir = async () => {
        const dir = await SelectDir();

        if (dir) {
            codeStore.setTabWorkingDir(props.tab.id, dir);
        }
    };

    createTooltip('#set-workdir-button', 'Select project');

    return (
        <div
            id="set-workdir-button"
            on:click={setWorkingDir}
            class="py-2 px-4 w-min max-w-36 truncate text-center whitespace-nowrap hover:brightness-110 select-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <FolderCode class="w-4 min-w-4 inline -mt-0.5 mr-1" />{' '}
            {props.tab.workingDir.split('/').pop()}
        </div>
    );
};

export default WorkingDirButton;
