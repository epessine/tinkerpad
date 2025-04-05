import { Component, For, Match, Switch } from 'solid-js';
import General from './General';
import Editor from './Editor';
import { Screen, SettingsTab, useGeneralStore } from '../../stores/general';
import Cog from '../icons/Cog';
import About from './About';
import XMark from '../icons/XMark';

const Settings: Component = () => {
    const [generalStore] = useGeneralStore();

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
                class="flex relative flex-col gap-2 border-r px-7"
                style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            >
                <XMark
                    class="w-5 h-5 absolute top-[0.3rem] left-[-1.5rem] cursor-pointer hover:brightness-105"
                    on:click={() => generalStore.setCurrentScreen(Screen.Code)}
                />
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
                        </div>
                    )}
                </For>
            </div>
            <div class="grow px-7">
                <Switch>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.General}>
                        <General />
                    </Match>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.Editor}>
                        <Editor />
                    </Match>
                    <Match when={generalStore.currentSettingsTab === SettingsTab.About}>
                        <About />
                    </Match>
                </Switch>
            </div>
        </div>
    );
};

export default Settings;
