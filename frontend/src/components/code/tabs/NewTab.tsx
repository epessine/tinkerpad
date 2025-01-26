import { Component } from 'solid-js';
import Plus from '../../icons/Plus';
import { useCodeStore } from '../../../stores/code';
import { createTooltip } from '../../../utils/tooltip/create';
import { useGeneralStore } from '../../../stores/general';

const NewTab: Component = () => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    createTooltip('#new-tab-button', 'New tab');

    return (
        <div
            id="new-tab-button"
            on:click={() => codeStore.createNewTab()}
            class="py-1.5 min-w-10 max-w-10 text-center grow hover:brightness-110"
            style={{
                color: generalStore.themeInfo.colors.primary,
                'background-color': generalStore.themeInfo.colors.background,
            }}
        >
            <Plus class="h-4 inline align-middle" />
        </div>
    );
};

export default NewTab;
