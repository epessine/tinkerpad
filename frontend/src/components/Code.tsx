import { Component, Show } from 'solid-js';
import Editor from './Editor';
import Tabs from './Tabs';
import StatusBar from './StatusBar';
import { useCodeStore } from '../stores/code';
import Result from './Result';

const Code: Component = () => {
    const [codeStore] = useCodeStore();

    return (
        <div class="flex flex-col grow w-full gap-1">
            <Tabs tabs={codeStore.tabs} currentTab={codeStore.currentTab} />
            <div class="flex grow" classList={{ 'flex-col': !codeStore.isHorizontalLayout }}>
                <Show when={codeStore.currentTab} keyed>
                    {tab => <Editor tab={tab} />}
                </Show>
                <Show when={codeStore.showResult && codeStore.currentTab.result} keyed>
                    {_ => <Result tab={codeStore.currentTab} />}
                </Show>
            </div>
            <Show when={codeStore.currentTab} keyed>
                {tab => <StatusBar tab={tab} />}
            </Show>
        </div>
    );
};

export default Code;
