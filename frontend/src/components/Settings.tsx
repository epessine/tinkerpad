import { Component, For, Match, Show, Switch } from 'solid-js';
import GeneralSettings from './GeneralSettings';
import EditorSettings from './EditorSettings';
import { SettingsTab, useGeneralStore } from '../stores/general';
import Cog from './icons/Cog';
import { useUpdateStore } from '../stores/update';
import UpdateSettings from './UpdateSettings';

const Settings: Component = () => {
    const [generalStore] = useGeneralStore();
    const [updateStore] = useUpdateStore();

    return (
        <div
            class="flex grow px-20 py-6 text-sm border-y cursor-default select-none"
            style={{
                'background-color': generalStore.themeInfo.colors.background,
                color: generalStore.themeInfo.colors.primary,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            <div
                class="flex flex-col gap-2 border-r px-7"
                style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            >
                <h1 class="text-lg mb-5 font-semibold drop-shadow">
                    <Cog class="h-5 w-5 inline mr-1.5 -mt-0.5 transition-all duration-75" />
                    Settings
                </h1>

                <For each={Object.values(SettingsTab)}>
                    {item => (
                        <div
                            classList={{
                                'font-bold brightness-105':
                                    item === generalStore.currentSettingsTab,
                                'hover:brightness-125': item !== generalStore.currentSettingsTab,
                            }}
                            class="relative"
                            on:click={() => generalStore.setCurrentSettingsTab(item)}
                        >
                            {item}
                            <Show when={item === SettingsTab.Updates && updateStore.hasUpdate}>
                                <div class="absolute w-1.5 h-1.5 rounded-full right-8 top-0.5 bg-red-600"></div>
                            </Show>
                        </div>
                    )}
                </For>
            </div>
            <div class="grow px-7">
                <Switch>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.General}>
                        <GeneralSettings />
                    </Match>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.Editor}>
                        <EditorSettings />
                    </Match>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.Updates}>
                        <UpdateSettings />
                    </Match>
                </Switch>
            </div>
        </div>
    );
};

export default Settings;
