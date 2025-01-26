import { Component, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import SshButton from './SshButton';
import DockerButton from './DockerButton';
import WorkingDirButton from './WorkingDirButton';
import FrameworkInfoLabel from './FrameworkInfoLabel';
import ResultStatsLabel from './ResultStatsLabel';
import ToggleResultTypeButton from './ToggleResultTypeButton';
import ToggleResultButton from './ToggleResultButton';
import ToggleLayoutButton from './ToggleLayoutButton';
import RunCodeButton from './RunCodeButton';

const StatusBar: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    return (
        <div
            class="flex justify-between text-xs border-y cursor-default"
            style={{
                color: generalStore.themeInfo.colors.primary,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            <div class="flex">
                <SshButton tab={props.tab} />
                <DockerButton tab={props.tab} />
                <WorkingDirButton tab={props.tab} />
                <FrameworkInfoLabel tab={props.tab} />
            </div>

            <div class="flex">
                <Show when={codeStore.showResult}>
                    <>
                        <ResultStatsLabel tab={props.tab} />
                        <ToggleResultTypeButton />
                    </>
                </Show>
                <ToggleResultButton />
                <ToggleLayoutButton />
                <RunCodeButton tab={props.tab} />
            </div>
        </div>
    );
};

export default StatusBar;
