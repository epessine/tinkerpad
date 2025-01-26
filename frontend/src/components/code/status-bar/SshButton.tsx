import { Component, createEffect, createResource, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { Screen, useGeneralStore } from '../../../stores/general';
import { ConnExists, RemoveConn } from '../../../../wailsjs/go/ssh/Ssh';
import Server from '../../icons/Server';
import ServerOff from '../../icons/ServerOff';
import { createTooltip } from '../../../utils/tooltip/create';

const SshButton: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    const [isSshConnected] = createResource(
        props.tab.sshConn?.uuid ?? '',
        async uuid => await ConnExists(uuid),
    );

    createEffect(() =>
        isSshConnected()
            ? createTooltip('#disconnect-ssh-button', 'Disconnect SSH')
            : createTooltip('#connect-ssh-button', 'Connect SSH'),
    );

    return (
        <Show
            when={props.tab.sshConn && isSshConnected()}
            fallback={
                <div
                    id="connect-ssh-button"
                    on:click={() =>
                        generalStore.setCurrentScreen(
                            generalStore.currentScreen === Screen.Ssh ? Screen.Code : Screen.Ssh,
                        )
                    }
                    classList={{
                        'brightness-125': generalStore.currentScreen === Screen.Ssh,
                    }}
                    class="py-2 px-4 w-min text-center whitespace-nowrap hover:brightness-110 select-none"
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
                }}
                class="py-2 group px-4 w-min max-w-40 flex gap-2 items-center text-center whitespace-nowrap hover:brightness-110 select-none"
                style={{ 'background-color': generalStore.themeInfo.colors.background }}
            >
                <Server class="w-4 min-w-4 -mt-0.5 inline group-hover:hidden" />
                <ServerOff class="w-4 min-w-4 -mt-0.5 hidden group-hover:inline" />
                <span class="truncate">
                    <b>{props.tab.sshConn?.name}</b>
                </span>
            </div>
        </Show>
    );
};

export default SshButton;
