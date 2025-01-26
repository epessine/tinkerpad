import { Component, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import LoaderCircle from '../../icons/LoaderCircle';
import SquarePlay from '../../icons/SquarePlay';
import { createTooltip } from '../../../utils/tooltip/create';

const RunCodeButton: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    createTooltip('#run-code-button', 'Run code');

    return (
        <div
            id="run-code-button"
            on:click={() => props.tab.loading || codeStore.runCode(props.tab)}
            class="py-2 px-4 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <Show
                when={props.tab.loading === false}
                fallback={<LoaderCircle class="w-4 inline -mt-0.5 animate-spin" />}
            >
                <SquarePlay class="w-4 inline -mt-0.5" />
            </Show>
        </div>
    );
};

export default RunCodeButton;
