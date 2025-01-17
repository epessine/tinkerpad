import { Component, createSignal, Show } from 'solid-js';
import Cog from './icons/Cog';
import {
    Quit,
    WindowIsMaximised,
    WindowMaximise,
    WindowUnmaximise,
} from '../../wailsjs/runtime/runtime';
import { createTooltip } from '../utils/tooltip/create';
import { listener } from '../utils/window-size/boot';
import { Screen, useGeneralStore } from '../stores/general';
import Star from './icons/Star';
import History from './icons/History';
import { useUpdateStore } from '../stores/update';
import { DownloadUpdate } from '../../wailsjs/go/updater/Updater';
import { Info } from '../../wailsjs/go/dialog/Dialog';
import LoaderCircle from './icons/LoaderCircle';

const TitleBar: Component = () => {
    const [generalStore] = useGeneralStore();
    const [updateStore] = useUpdateStore();
    const [isDownloading, setIsDownloading] = createSignal(false);

    createTooltip('#open-settings-button', 'Open settings');
    createTooltip('#open-favorites-button', 'Open favorites');
    createTooltip('#open-history-button', 'Open history');

    return (
        <div
            on:dblclick={async () =>
                (await WindowIsMaximised()) ? WindowUnmaximise() : WindowMaximise()
            }
            on:mouseup={listener}
            class="relative w-full text-sm text-center py-2 font-bold cursor-default select-none"
            style={{
                '--wails-draggable': 'drag',
                'background-color': generalStore.themeInfo.colors.background,
                color: generalStore.themeInfo.colors.primary,
            }}
        >
            tinkerpad
            <div class="absolute top-2 flex right-2 gap-2">
                <Show when={updateStore.hasUpdate}>
                    <div
                        on:click={async () => {
                            setIsDownloading(true);
                            try {
                                await DownloadUpdate(updateStore.info!.url);
                                Quit();
                            } catch (error) {
                                Info('Error downloading update.');
                            }
                            setIsDownloading(false);
                        }}
                        class="flex gap-1 items-center h-min text-xs px-2 font-semibold rounded-md -mt-[1px] mr-0.5 border p-0.5 hover:brightness-110"
                    >
                        <Show when={isDownloading()}>
                            <LoaderCircle class="w-3 h-3 animate-spin" />
                        </Show>
                        Update
                    </div>
                </Show>
                <div
                    id="open-history-button"
                    on:dblclick={e => e.stopPropagation()}
                    on:click={e =>
                        generalStore.setCurrentScreen(
                            generalStore.currentScreen === Screen.History
                                ? Screen.Code
                                : Screen.History,
                        )
                    }
                    class="p-0.5 -mt-0.5 rounded-md hover:brightness-110"
                    style={{
                        'background-color':
                            generalStore.themeInfo.colors[
                                generalStore.currentScreen === Screen.History
                                    ? 'primary'
                                    : 'background'
                            ],
                        color: generalStore.themeInfo.colors[
                            generalStore.currentScreen === Screen.History ? 'background' : 'primary'
                        ],
                    }}
                >
                    <History class="h-5 w-5 transition-all duration-75" />
                </div>
                <div
                    id="open-favorites-button"
                    on:dblclick={e => e.stopPropagation()}
                    on:click={e =>
                        generalStore.setCurrentScreen(
                            generalStore.currentScreen === Screen.Favorites
                                ? Screen.Code
                                : Screen.Favorites,
                        )
                    }
                    class="p-0.5 -mt-0.5 rounded-md hover:brightness-110"
                    style={{
                        'background-color':
                            generalStore.themeInfo.colors[
                                generalStore.currentScreen === Screen.Favorites
                                    ? 'primary'
                                    : 'background'
                            ],
                        color: generalStore.themeInfo.colors[
                            generalStore.currentScreen === Screen.Favorites
                                ? 'background'
                                : 'primary'
                        ],
                    }}
                >
                    <Star class="h-5 w-5 transition-all duration-75" />
                </div>
                <div
                    id="open-settings-button"
                    on:dblclick={e => e.stopPropagation()}
                    on:click={e =>
                        generalStore.setCurrentScreen(
                            generalStore.currentScreen === Screen.Settings
                                ? Screen.Code
                                : Screen.Settings,
                        )
                    }
                    class="p-0.5 -mt-0.5 rounded-md hover:brightness-110 relative"
                    style={{
                        'background-color':
                            generalStore.themeInfo.colors[
                                generalStore.currentScreen === Screen.Settings
                                    ? 'primary'
                                    : 'background'
                            ],
                        color: generalStore.themeInfo.colors[
                            generalStore.currentScreen === Screen.Settings
                                ? 'background'
                                : 'primary'
                        ],
                    }}
                >
                    <Cog class="h-5 w-5 transition-all duration-75" />
                </div>
            </div>
        </div>
    );
};

export default TitleBar;
