import { Component, createResource, createSignal, For, Show } from 'solid-js';
import { Screen, useGeneralStore } from '../stores/general';
import { useCodeStore } from '../stores/code';
import StatusBar from './StatusBar';
import { docker } from '../../wailsjs/go/models';
import Docker from './icons/Docker';
import { Connect, GetAll, Save } from '../../wailsjs/go/docker/Docker';
import { RemoveConn } from '../../wailsjs/go/ssh/Ssh';
import Refresh from './icons/Refresh';
import { createTooltip } from '../utils/tooltip/create';
import EditDockerContainerInfo from './EditDockerContainerInfo';

const DockerConfig: Component = () => {
    const [selectedContainer, setSelectedContainer] = createSignal<
        docker.ContainerInfo | undefined
    >(undefined);
    const [containers, { mutate, refetch }] = createResource(async () => await GetAll());
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    const saveInfo = async (info: docker.ContainerInfo, connect: boolean = false) => {
        if (connect) {
            const phpRunnerPath = await Connect(info);
            info.phpRunnerPath = phpRunnerPath;
        }

        const newContainers = containers()!
            .filter(c => c.id !== info.id)
            .concat([info]);
        mutate(newContainers);
        await Save(containers()!);
        await refetch();

        if (!connect) {
            setSelectedContainer(info);
            return;
        }

        if (codeStore.currentTab.sshConn) {
            await RemoveConn(codeStore.currentTab.sshConn.uuid);
            codeStore.setTabSshConnection(codeStore.currentTabId);
        }
        codeStore.setTabContainerInfo(codeStore.currentTabId, info);
        generalStore.setCurrentScreen(Screen.Code);
    };

    createTooltip('#refresh-containers-button', 'Refresh containers');

    return (
        <div class="flex flex-col grow max-h-full">
            <div
                class="flex grow px-20 py-6 text-sm border-t cursor-default select-none max-h-full"
                style={{
                    'background-color': generalStore.themeInfo.colors.background,
                    color: generalStore.themeInfo.colors.primary,
                    'border-color': generalStore.themeInfo.colors.secondary,
                }}
            >
                <div
                    class="flex flex-col gap-2 border-r px-7 min-w-[30%] max-w-[30%]"
                    style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                >
                    <h1 class="text-lg mb-5 font-semibold drop-shadow">
                        <Docker class="h-5 w-5 inline mr-1.5 -mt-0.5 transition-all duration-75" />
                        Docker
                    </h1>
                    <h2 class="font-bold flex justify-between items-center">
                        <span>Running local containers</span>
                        <Refresh
                            on:click={() => refetch()}
                            id="refresh-containers-button"
                            class="w-4"
                            classList={{
                                'animate-spin': containers.loading,
                            }}
                        />
                    </h2>
                    <hr
                        class="my-2 -mx-3"
                        style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                    />
                    <div class="flex flex-col max-h-[65%] overflow-y-auto soft-scrollbar">
                        <For
                            each={containers()!}
                            fallback={<div>No Docker containers running yet.</div>}
                        >
                            {info => (
                                <div class="flex items-center justify-between gap-3 group min-h-7 w-full pr-2">
                                    <div
                                        on:click={() => setSelectedContainer(info)}
                                        class="max-w-[80%] w-[80%] truncate"
                                        classList={{
                                            'font-bold brightness-105':
                                                selectedContainer()?.id === info.id,
                                            'hover:brightness-125':
                                                selectedContainer()?.id !== info.id,
                                        }}
                                    >
                                        {info.name}
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
                <div class="grow px-7">
                    <Show keyed when={selectedContainer()}>
                        {info => <EditDockerContainerInfo info={info} saveInfo={saveInfo} />}
                    </Show>
                </div>
            </div>
            <Show when={codeStore.currentTab} keyed>
                {tab => <StatusBar tab={tab} />}
            </Show>
        </div>
    );
};

export default DockerConfig;
