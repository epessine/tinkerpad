import { Component, createMemo, createResource, createSignal, Show } from 'solid-js';
import { useGeneralStore } from '../../stores/general';
import HistoryIcon from './../icons/History';
import { GetAll } from '../../../wailsjs/go/history/History';
import ArrowLeft from '../icons/ArrowLeft';
import ArrowRight from '../icons/ArrowRight';
import ViewHistoryLog from './View';

const History: Component = () => {
    const [currentIndex, setCurrentIndex] = createSignal(0);
    const [logs] = createResource(async () => {
        const logs = await GetAll();
        setCurrentIndex(logs.length - 1);
        return logs;
    });
    const [generalStore] = useGeneralStore();
    const currentLog = createMemo(() => (!logs.loading ? logs()![currentIndex()] : undefined));

    return (
        <div
            class="flex flex-col grow px-20 py-6 text-sm border-y cursor-default select-none max-h-full"
            style={{
                'background-color': generalStore.themeInfo.colors.background,
                color: generalStore.themeInfo.colors.primary,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            <div class="flex mb-5 justify-between items-center gap-2 px-7">
                <h1 class="text-lg font-semibold drop-shadow">
                    <HistoryIcon class="h-5 w-5 inline mr-1.5 -mt-0.5 transition-all duration-75" />
                    History
                </h1>

                <Show when={logs()?.length}>
                    <div class="flex gap-2 items-center">
                        <ArrowLeft
                            on:click={() => currentIndex() && setCurrentIndex(currentIndex() - 1)}
                            class="w-6 hover:brightness-110"
                        />
                        <span>
                            {currentIndex() + 1} of {logs()?.length}
                        </span>
                        <ArrowRight
                            on:click={() =>
                                currentIndex() < logs()!.length - 1 &&
                                setCurrentIndex(currentIndex() + 1)
                            }
                            class="w-6 hover:brightness-110"
                        />
                    </div>
                </Show>
            </div>
            <div class="grow px-7">
                <Show keyed when={currentLog()} fallback={<div>You have no history log yet.</div>}>
                    {log => <ViewHistoryLog log={log} />}
                </Show>
            </div>
        </div>
    );
};

export default History;
