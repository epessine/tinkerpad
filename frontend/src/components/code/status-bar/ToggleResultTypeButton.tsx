import { Component, createEffect, Match, Switch } from 'solid-js';
import { useGeneralStore } from '../../../stores/general';
import { OutputType, useCodeStore } from '../../../stores/code';
import FileJson from '../../icons/FileJson';
import FileBox from '../../icons/FileBox';
import { createTooltip } from '../../../utils/tooltip/create';

const ToggleResultTypeButton: Component = () => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    createEffect(
        () =>
            codeStore.showResult &&
            createTooltip('#toggle-result-type-button', 'Toggle result type'),
    );

    return (
        <div
            id="toggle-result-type-button"
            on:click={() =>
                codeStore.setOutputType(
                    codeStore.outputType === OutputType.Raw
                        ? OutputType.Structured
                        : OutputType.Raw,
                )
            }
            class="py-2 px-4 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <Switch>
                <Match when={codeStore.outputType === OutputType.Raw}>
                    <FileJson class="w-4 inline -mt-0.5" />
                </Match>
                <Match when={codeStore.outputType === OutputType.Structured}>
                    <FileBox class="w-4 inline -mt-0.5" />
                </Match>
            </Switch>
        </div>
    );
};

export default ToggleResultTypeButton;
