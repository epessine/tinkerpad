import { Component, createEffect, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { Screen, useGeneralStore } from '../../../stores/general';
import Docker from '../../icons/Docker';
import { createTooltip } from '../../../utils/tooltip/create';

const DockerButton: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    createEffect(() =>
        props.tab.containerInfo
            ? createTooltip('#disconnect-docker-button', 'Disconnect Docker')
            : createTooltip('#connect-docker-button', 'Connect Docker'),
    );

    return (
        <Show
            when={props.tab.containerInfo}
            fallback={
                <div
                    id="connect-docker-button"
                    on:click={() =>
                        generalStore.setCurrentScreen(
                            generalStore.currentScreen === Screen.Docker
                                ? Screen.Code
                                : Screen.Docker,
                        )
                    }
                    classList={{
                        'brightness-125': generalStore.currentScreen === Screen.Docker,
                    }}
                    class="py-2 px-4 w-min flex items-center text-center whitespace-nowrap hover:brightness-110 select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Docker class="w-5 inline -mt-0.5" />
                </div>
            }
        >
            <div
                id="disconnect-docker-button"
                on:click={() => {
                    codeStore.setTabContainerInfo(props.tab.id);
                }}
                classList={{
                    'brightness-125': generalStore.currentScreen === Screen.Docker,
                }}
                class="py-2 px-4 w-min max-w-40 text-center flex items-center gap-2 group relative whitespace-nowrap hover:brightness-110 select-none"
                style={{ 'background-color': generalStore.themeInfo.colors.background }}
            >
                <Docker class="w-5 min-w-5 inline -mt-0.5" />
                <div
                    class="absolute h-[1.3px] w-[25px] left-3 -rotate-45 top-[18px] hidden drop-shadow group-hover:block"
                    style={{ 'background-color': generalStore.themeInfo.colors.primary }}
                ></div>
                <span class="truncate">
                    <b>{props.tab.containerInfo?.name}</b>
                </span>
            </div>
        </Show>
    );
};

export default DockerButton;
