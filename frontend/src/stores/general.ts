import { createEffect } from 'solid-js';
import { store } from '../../wailsjs/go/models';
import { GetData, Save } from '../../wailsjs/go/store/Store';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { Theme } from '../utils/editor/themes';
import getThemeInfo from '../utils/theme/get-theme-info';
import { IsLinux } from '../../wailsjs/go/settings/Settings';

export enum SettingsTab {
    General = 'General',
    Editor = 'Editor',
    About = 'About',
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
    themeInfo: await getThemeInfo(Theme.Nord),
    ...(rawData && JSON.parse(rawData)),
    isLinux: await IsLinux(),
    currentScreen: Screen.Code,
    currentSettingsTab: SettingsTab.General,
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
        setGeneralStore('themeInfo', await getThemeInfo(theme));
    },
    shouldShowTitleBar(): boolean {
        return (
            [Screen.Settings, Screen.Favorites, Screen.History].includes(this.currentScreen) ||
            !this.isLinux
        );
    },
};

const [generalStore, setGeneralStore] = createStore(newGeneralStore);

createEffect(() => Save(store.StoreName.General, JSON.stringify({ ...generalStore })));

export interface GeneralStore {
    isLinux: boolean;
    currentScreen: Screen;
    currentSettingsTab: SettingsTab;
    window?: WindowStats;
    themeInfo: ThemeInfo;
    setCurrentSettingsTab: (tab: SettingsTab) => void;
    setCurrentScreen: (screen: Screen) => void;
    setWindowStats: (stats: WindowStats) => void;
    setTheme: (theme: Theme) => Promise<void>;
    shouldShowTitleBar: () => boolean;
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
        editor: {
            string: string;
            keyword: string;
            variable: string;
        };
    };
}

export const useGeneralStore = (): [GeneralStore, SetStoreFunction<GeneralStore>] => [
    generalStore,
    setGeneralStore,
];
