import { Component, Show } from 'solid-js';
import { useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import SquareSplitVertical from '../../icons/SquareSplitVertical';
import SquareSplitHorizontal from '../../icons/SquareSplitHorizontal';
import { createTooltip } from '../../../utils/tooltip/create';

const ToggleLayoutButton: Component = () => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();

    createTooltip('#toggle-layout-button', 'Toggle layout');

    return (
        <div
            id="toggle-layout-button"
            on:click={codeStore.toggleLayout}
            class="py-2 px-4 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <Show
                when={codeStore.isHorizontalLayout}
                fallback={<SquareSplitVertical class="w-4 inline -mt-0.5" />}
            >
                <SquareSplitHorizontal class="w-4 inline -mt-0.5" />
            </Show>
        </div>
    );
};

export default ToggleLayoutButton;
