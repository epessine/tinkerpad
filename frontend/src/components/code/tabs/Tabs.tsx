import { Component, Show } from 'solid-js';
import { For } from 'solid-js';
import Tab from './Tab';
import NewTab from './NewTab';
import { Tab as StoreTab } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import TitleBar from '../../TitleBar';
import { useUpdateStore } from '../../../stores/update';

const Tabs: Component<{ tabs: StoreTab[]; currentTab: StoreTab }> = props => {
    const [generalStore] = useGeneralStore();
    const [updateStore] = useUpdateStore();

    return (
        <div
            class="border-b"
            style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            classList={{
                'flex justify-between items-center': !generalStore.shouldShowTitleBar(),
                'border-t': !generalStore.isLinux,
            }}
        >
            <nav
                class="flex text-sm"
                style={{
                    'max-width': !generalStore.shouldShowTitleBar()
                        ? `calc(100vw - ${updateStore.hasUpdate ? 11.2 : 6.6}rem)`
                        : 'unset',
                }}
            >
                <For each={props.tabs}>
                    {tab => <Tab tab={tab} isActive={tab.id === props.currentTab.id} />}
                </For>
                <NewTab />
            </nav>
            <Show when={!generalStore.shouldShowTitleBar()}>
                <TitleBar />
            </Show>
        </div>
    );
};

export default Tabs;
