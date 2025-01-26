import { Component, Show } from 'solid-js';
import { useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import Square from '../../icons/Square';
import SquareCode from '../../icons/SquareCode';
import { createTooltip } from '../../../utils/tooltip/create';

const ToggleResultButton: Component = () => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();

    createTooltip('#toggle-result-button', 'Toggle output');

    return (
        <div
            id="toggle-result-button"
            on:click={codeStore.toggleResult}
            class="py-2 px-4 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <Show when={codeStore.showResult} fallback={<Square class="w-4 inline -mt-0.5" />}>
                <SquareCode class="w-4 inline -mt-0.5" />
            </Show>
        </div>
    );
};

export default ToggleResultButton;
