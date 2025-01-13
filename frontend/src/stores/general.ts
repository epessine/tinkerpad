import { createEffect } from 'solid-js';
import { store } from '../../wailsjs/go/models';
import { GetData, Save } from '../../wailsjs/go/store/Store';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { Theme } from '../utils/editor/themes';
import defaultThemeData from '../assets/themes/Nord.json';

export enum SettingsTab {
    General = 'General',
    Editor = 'Editor',
}

export enum Screen {
    Code,
    Settings,
    Favorites,
    History,
    Ssh,
    Docker,
}

const rawData = await GetData(store.StoreName.General);

const newGeneralStore: GeneralStore = {
    currentScreen: Screen.Code,
    currentSettingsTab: SettingsTab.General,
    themeInfo: {
        name: Theme.Nord,
        colors: {
            background: defaultThemeData.colors['editor.background'],
            primary: defaultThemeData.colors['editor.foreground'],
            secondary: defaultThemeData.colors['editor.lineHighlightBackground'],
        },
    },
    ...(rawData && JSON.parse(rawData)),
    setCurrentSettingsTab(tab: SettingsTab) {
        setGeneralStore('currentSettingsTab', tab);
    },
    setCurrentScreen(screen: Screen) {
        setGeneralStore('currentScreen', screen);
    },
    setWindowStats(stats: WindowStats) {
        setGeneralStore('window', stats);
    },
    async setTheme(theme: Theme) {
        const themeData = await import(`../assets/themes/${theme}.json`);

        setGeneralStore('themeInfo', {
            name: theme,
            colors: {
                background: themeData.colors['editor.background'],
                primary: themeData.colors['editor.foreground'],
                secondary: themeData.colors['editor.lineHighlightBackground'],
            },
        });
    },
};

const [generalStore, setGeneralStore] = createStore(newGeneralStore);

createEffect(() => Save(store.StoreName.General, JSON.stringify({ ...generalStore })));

export interface GeneralStore {
    currentScreen: Screen;
    currentSettingsTab: SettingsTab;
    window?: WindowStats;
    themeInfo: ThemeInfo;
    setCurrentSettingsTab: (tab: SettingsTab) => void;
    setCurrentScreen: (screen: Screen) => void;
    setWindowStats: (stats: WindowStats) => void;
    setTheme: (theme: Theme) => Promise<void>;
}

export interface WindowStats {
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface ThemeInfo {
    name: Theme;
    colors: {
        background: string;
        primary: string;
        secondary: string;
    };
}

export const useGeneralStore = (): [GeneralStore, SetStoreFunction<GeneralStore>] => [
    generalStore,
    setGeneralStore,
];
