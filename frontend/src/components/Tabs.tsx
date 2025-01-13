import { Component } from 'solid-js';
import { For } from 'solid-js';
import Tab from './Tab';
import NewTab from './NewTab';
import { Tab as StoreTab } from '../stores/code';
import { useGeneralStore } from '../stores/general';

const Tabs: Component<{ tabs: StoreTab[]; currentTab: StoreTab }> = props => {
    const [generalStore] = useGeneralStore();

    return (
        <nav
            class="flex text-sm border-y"
            style={{
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            <For each={props.tabs}>
                {tab => <Tab tab={tab} isActive={tab.id === props.currentTab.id} />}
            </For>
            <NewTab />
        </nav>
    );
};

export default Tabs;
