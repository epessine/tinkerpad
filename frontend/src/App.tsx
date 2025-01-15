import { Match, onCleanup, onMount, Switch, type Component } from 'solid-js';
import { initServices } from 'monaco-languageclient/vscode/services';
import Code from './components/Code';
import TitleBar from './components/TitleBar';
import Settings from './components/Settings';
import { boot } from './utils/window-size/boot';
import { registerHotkeys } from './utils/hotkey/register';
import { Screen, useGeneralStore } from './stores/general';
import Favorites from './components/Favorites';
import History from './components/History';
import SshConfig from './components/SshConfig';
import DockerConfig from './components/DockerConfig';
import { CheckUpdate } from '../wailsjs/go/updater/Updater';

await initServices({
    serviceConfig: {
        debugLogging: true,
    },
});

const App: Component = () => {
    const [generalStore] = useGeneralStore();
    let removeWindowResizeListener: () => void;

    onMount(() => {
        removeWindowResizeListener = boot();
        CheckUpdate();
    });
    onCleanup(() => removeWindowResizeListener());

    registerHotkeys();

    return (
        <div
            class="flex flex-col h-screen max-h-screen overflow-y-hidden snap-none"
            style={{ 'background-color': generalStore.themeInfo.colors.background }}
        >
            <TitleBar />
            <Switch>
                <Match when={generalStore.currentScreen === Screen.Code}>
                    <Code />
                </Match>
                <Match when={generalStore.currentScreen === Screen.Settings}>
                    <Settings />
                </Match>
                <Match when={generalStore.currentScreen === Screen.Favorites}>
                    <Favorites />
                </Match>
                <Match when={generalStore.currentScreen === Screen.History}>
                    <History />
                </Match>
                <Match when={generalStore.currentScreen === Screen.Ssh}>
                    <SshConfig />
                </Match>
                <Match when={generalStore.currentScreen === Screen.Docker}>
                    <DockerConfig />
                </Match>
            </Switch>
        </div>
    );
};

export default App;
