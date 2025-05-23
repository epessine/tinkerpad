import { Component, createEffect, Match, onCleanup, Show, Switch } from 'solid-js';
import Editor from './Editor';
import Tabs from './tabs/Tabs';
import StatusBar from './status-bar/StatusBar';
import { OutputType, useCodeStore } from '../../stores/code';
import Result from './Result';
import Split from 'split.js';
import StructuredResult from './StructuredResult';
import { useGeneralStore } from '../../stores/general';

const Code: Component = () => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();
    var leftPane!: HTMLDivElement;
    var rightPane!: HTMLDivElement;
    var split: Split.Instance;

    createEffect(() => {
        const size = codeStore.currentTab.size ?? 50;

        if (!codeStore.showResult || !codeStore.currentTab.result) {
            return;
        }

        split = Split([leftPane, rightPane], {
            sizes: [size, 100 - size],
            direction: codeStore.isHorizontalLayout ? 'horizontal' : 'vertical',
            onDragEnd: ([size]) => codeStore.setTabSize(codeStore.currentTabId, size),
        });

        onCleanup(() => split.destroy());
    });

    return (
        <div class="flex flex-col grow w-full gap-1">
            <Tabs tabs={codeStore.tabs} currentTab={codeStore.currentTab} />
            <div
                class="flex grow"
                style={{
                    'max-height': `calc(100vh - ${generalStore.shouldShowTitleBar() ? 7.5 : 5.3}rem)`,
                }}
                classList={{ 'flex-col': !codeStore.isHorizontalLayout }}
            >
                <Show when={codeStore.currentTab} keyed>
                    {tab => (
                        <>
                            <div class="grow" ref={leftPane}>
                                <Editor tab={tab} />
                            </div>
                            <Show when={codeStore.showResult}>
                                <Show when={tab.result} keyed>
                                    {result => (
                                        <div class="grow" ref={rightPane}>
                                            <Switch>
                                                <Match
                                                    when={codeStore.outputType === OutputType.Raw}
                                                >
                                                    {_ => <Result tab={tab} />}
                                                </Match>
                                                <Match
                                                    when={
                                                        codeStore.outputType ===
                                                        OutputType.Structured
                                                    }
                                                >
                                                    {_ => <StructuredResult result={result} />}
                                                </Match>
                                            </Switch>
                                        </div>
                                    )}
                                </Show>
                            </Show>
                        </>
                    )}
                </Show>
            </div>
            <Show when={codeStore.currentTab} keyed>
                {tab => <StatusBar tab={tab} />}
            </Show>
        </div>
    );
};

export default Code;
