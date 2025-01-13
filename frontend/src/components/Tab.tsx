import { Component, Show } from 'solid-js';
import { Tab as StoreTab, useCodeStore } from '../stores/code';
import XMark from './icons/XMark';
import { useGeneralStore } from '../stores/general';
import Server from './icons/Server';
import Docker from './icons/Docker';

const Tab: Component<{ tab: StoreTab; isActive: boolean }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    return (
        <div
            classList={{
                'relative box-border text-xs max-w-64 py-2 px-8 select-none truncate cursor-default text-center flex-grow hover:brightness-110 group':
                    true,
                'font-extrabold border-b-2': props.isActive,
            }}
            style={{
                'background-color': generalStore.themeInfo.colors.background,
                color: generalStore.themeInfo.colors.primary,
                'border-color': props.tab.sshConn?.color ?? generalStore.themeInfo.colors.primary,
            }}
            on:click={() => codeStore.setCurrentTab(props.tab.id)}
        >
            {props.tab.sshConn?.name ??
                props.tab.containerInfo?.name ??
                props.tab.workingDir.split('/').pop()!}
            <Show when={codeStore.tabs.length > 1}>
                <div
                    on:click={e => {
                        e.stopPropagation();
                        codeStore.closeTab(props.tab.id);
                    }}
                    class="absolute right-2.5 top-1 hidden group-hover:block hover:brightness-110"
                >
                    <XMark class="w-4" />
                </div>
            </Show>
            <Show when={props.tab.sshConn}>
                <div
                    on:click={e => {
                        e.stopPropagation();
                        codeStore.closeTab(props.tab.id);
                    }}
                    class="absolute left-2.5 top-1"
                >
                    <Server class="w-4" />
                </div>
            </Show>
            <Show when={props.tab.containerInfo}>
                <div
                    on:click={e => {
                        e.stopPropagation();
                        codeStore.closeTab(props.tab.id);
                    }}
                    class="absolute left-2.5 top-2"
                >
                    <Docker class="w-[18px]" />
                </div>
            </Show>
        </div>
    );
};

export default Tab;
