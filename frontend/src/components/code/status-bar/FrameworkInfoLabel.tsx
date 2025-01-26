import { Component, createEffect, createResource, Show } from 'solid-js';
import { Tab, useCodeStore } from '../../../stores/code';
import { useGeneralStore } from '../../../stores/general';
import LoaderCircle from '../../icons/LoaderCircle';
import Code from '../../icons/Code';

export type FrameworkInfo = {
    framework_name: string;
    framework_version: string | undefined;
    php_version: string;
};

const FrameworkInfoLabel: Component<{ tab: Tab }> = props => {
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();
    const [frameworkInfo, { refetch }] = createResource(props.tab, async tab => {
        return await codeStore.getTabFrameworkInfo(tab.id);
    });

    createEffect(() => refetch([props.tab.workingDir, props.tab.containerInfo, props.tab.sshConn]));

    return (
        <>
            <div
                class="py-2 px-4 w-min text-center whitespace-nowrap select-none"
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
                class="py-2 px-4 w-min text-center whitespace-nowrap select-none"
                style={{ 'background-color': generalStore.themeInfo.colors.background }}
            >
                <Show when={!frameworkInfo.loading}>
                    <span class="align-middle inline-flex mt-0.5">
                        PHP {frameworkInfo()!.php_version}
                    </span>
                </Show>
            </div>
        </>
    );
};

export default FrameworkInfoLabel;
