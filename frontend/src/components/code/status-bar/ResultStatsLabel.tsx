import { Component, createEffect, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import Timer from '../../icons/Timer';
import Cpu from '../../icons/Cpu';
import { useGeneralStore } from '../../../stores/general';
import { createTooltip } from '../../../utils/tooltip/create';

const ResultStatsLabel: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    createEffect(() => {
        if (codeStore.showResult && props.tab.result) {
            createTooltip('#memory-usage', 'Peak Memory Usage');
            createTooltip('#run-time', 'Run time');
        }
    });

    return (
        <Show when={props.tab.result} keyed>
            {res =>
                typeof res !== 'string' && (
                    <>
                        <div
                            id="run-time"
                            class="py-2 px-3 w-min text-center whitespace-nowrap select-none"
                            style={{
                                'background-color': generalStore.themeInfo.colors.background,
                            }}
                        >
                            <Timer class="w-4 inline-flex -mt-0.5 mr-1.5" />
                            <span>{(res.time * 1000).toFixed(3)} ms</span>
                        </div>
                        <div
                            id="memory-usage"
                            class="py-2 px-3 w-min text-center whitespace-nowrap select-none"
                            style={{
                                'background-color': generalStore.themeInfo.colors.background,
                            }}
                        >
                            <Cpu class="w-4 inline -mt-0.5 mr-1.5" />
                            {(res.peakMemoryUsage / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </>
                )
            }
        </Show>
    );
};

export default ResultStatsLabel;
