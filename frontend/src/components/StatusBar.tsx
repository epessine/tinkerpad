import { Component, createEffect, createResource, Show } from 'solid-js';
import FolderCode from './icons/FolderCode';
import SquarePlay from './icons/SquarePlay';
import { Tab, useCodeStore } from '../stores/code';
import LoaderCircle from './icons/LoaderCircle';
import Code from './icons/Code';
import { SelectDir } from '../../wailsjs/go/dialog/Dialog';
import SquareSplitHorizontal from './icons/SquareSplitHorizontal';
import SquareSplitVertical from './icons/SquareSplitVertical';
import { createTooltip } from '../utils/tooltip/create';
import SquareCode from './icons/SquareCode';
import Square from './icons/Square';
import { Screen, useGeneralStore } from '../stores/general';
import Server from './icons/Server';
import { ConnExists, RemoveConn } from '../../wailsjs/go/ssh/Ssh';
import ServerOff from './icons/ServerOff';
import Docker from './icons/Docker';

export type FrameworkInfo = {
    framework_name: string;
    framework_version: string | undefined;
    php_version: string;
};

const StatusBar: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();
    const [frameworkInfo, { refetch }] = createResource(props.tab, async tab => {
        return await codeStore.getTabFrameworkInfo(tab.id);
    });
    const [isSshConnected] = createResource(
        props.tab.sshConn?.uuid ?? '',
        async uuid => await ConnExists(uuid),
    );

    const setWorkingDir = async () => {
        const dir = await SelectDir();

        if (dir) {
            codeStore.setTabWorkingDir(props.tab.id, dir);
        }
    };

    createEffect(() =>
        isSshConnected()
            ? createTooltip('#disconnect-ssh-button', 'Disconnect SSH')
            : createTooltip('#connect-ssh-button', 'Connect SSH'),
    );
    createEffect(() =>
        props.tab.containerInfo
            ? createTooltip('#disconnect-docker-button', 'Disconnect Docker')
            : createTooltip('#connect-docker-button', 'Connect Docker'),
    );

    createTooltip('#set-workdir-button', 'Select project');
    createTooltip('#toggle-layout-button', 'Toggle layout');
    createTooltip('#toggle-result-button', 'Toggle output');
    createTooltip('#run-code-button', 'Run code');

    return (
        <div
            class="flex justify-between text-xs border-y cursor-default"
            style={{
                color: generalStore.themeInfo.colors.primary,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            <div class="flex">
                <Show
                    when={props.tab.sshConn && isSshConnected()}
                    fallback={
                        <div
                            id="connect-ssh-button"
                            on:click={() =>
                                generalStore.setCurrentScreen(
                                    generalStore.currentScreen === Screen.Ssh
                                        ? Screen.Code
                                        : Screen.Ssh,
                                )
                            }
                            classList={{
                                'brightness-125': generalStore.currentScreen === Screen.Ssh,
                            }}
                            class="py-2 px-5 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
                            style={{ 'background-color': generalStore.themeInfo.colors.background }}
                        >
                            <Server class="w-4 -mt-0.5 inline" />
                        </div>
                    }
                >
                    <div
                        id="disconnect-ssh-button"
                        on:click={async () => {
                            await RemoveConn(props.tab.sshConn!.uuid);
                            codeStore.setTabSshConnection(props.tab.id);
                            refetch();
                        }}
                        class="py-2 group px-5 w-min flex gap-2 items-center text-center whitespace-nowrap hover:brightness-110 select-none"
                        style={{ 'background-color': generalStore.themeInfo.colors.background }}
                    >
                        <Server class="w-4 -mt-0.5 inline group-hover:hidden" />
                        <ServerOff class="w-4 -mt-0.5 hidden group-hover:inline" />
                        <span>
                            Connected to <b>{props.tab.sshConn?.name}</b>
                        </span>
                    </div>
                </Show>
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
                            class="py-2 px-5 w-min flex items-center text-center whitespace-nowrap hover:brightness-110 select-none"
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
                            refetch();
                        }}
                        classList={{
                            'brightness-125': generalStore.currentScreen === Screen.Docker,
                        }}
                        class="py-2 px-5 w-min text-center flex items-center gap-2 group relative whitespace-nowrap hover:brightness-110 select-none"
                        style={{ 'background-color': generalStore.themeInfo.colors.background }}
                    >
                        <Docker class="w-5 inline -mt-0.5" />
                        <div
                            class="absolute h-[1.3px] w-[25px] left-4 -rotate-45 top-[18px] hidden drop-shadow group-hover:block"
                            style={{ 'background-color': generalStore.themeInfo.colors.primary }}
                        ></div>
                        <span>
                            Connected to <b>{props.tab.containerInfo?.name}</b>
                        </span>
                    </div>
                </Show>

                <div
                    id="set-workdir-button"
                    on:click={setWorkingDir}
                    class="py-2 px-5 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <FolderCode class="w-4 inline -mt-0.5 mr-1" />{' '}
                    {props.tab.workingDir.split('/').pop()}
                </div>
                <div
                    class="py-2 px-5 w-min text-center whitespace-nowrap select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Show
                        when={!frameworkInfo.loading}
                        fallback={<LoaderCircle class="w-4 inline -mt-0.5 animate-spin" />}
                    >
                        <Code class="w-4 inline -mt-0.5 mr-1.5" />
                        {frameworkInfo()!.framework_name} {frameworkInfo()!.framework_version}
                    </Show>
                </div>
                <div
                    class="py-2 px-5 w-min text-center whitespace-nowrap select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Show when={!frameworkInfo.loading}>
                        <span class="align-middle">PHP {frameworkInfo()!.php_version}</span>
                    </Show>
                </div>
            </div>

            <div class="flex">
                <div
                    id="toggle-result-button"
                    on:click={codeStore.toggleResult}
                    class="py-2 px-5 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Show
                        when={codeStore.showResult}
                        fallback={<Square class="w-4 inline -mt-0.5" />}
                    >
                        <SquareCode class="w-4 inline -mt-0.5" />
                    </Show>
                </div>
                <div
                    id="toggle-layout-button"
                    on:click={codeStore.toggleLayout}
                    class="py-2 px-5 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Show
                        when={codeStore.isHorizontalLayout}
                        fallback={<SquareSplitVertical class="w-4 inline -mt-0.5" />}
                    >
                        <SquareSplitHorizontal class="w-4 inline -mt-0.5" />
                    </Show>
                </div>
                <div
                    id="run-code-button"
                    on:click={() => props.tab.loading || codeStore.runCode(props.tab)}
                    class="py-2 px-5 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
                    style={{ 'background-color': generalStore.themeInfo.colors.background }}
                >
                    <Show
                        when={!props.tab.loading}
                        fallback={<LoaderCircle class="w-4 inline -mt-0.5 animate-spin" />}
                    >
                        <SquarePlay class="w-4 inline -mt-0.5" />
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
