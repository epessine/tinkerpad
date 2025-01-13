import { createStore, SetStoreFunction } from 'solid-js/store';
import { GetData, Save } from '../../wailsjs/go/settings/Settings';
import { settings } from '../../wailsjs/go/models';
import { createEffect } from 'solid-js';

const app = await GetData();

const newSettingsStore: SettingsStore = {
    app,
    saveApp: app => setStore('app', app),
    saveEditor: editor => setStore('app', { ...store.app, editor }),
};

const [store, setStore] = createStore(newSettingsStore);

createEffect(() => Save(store.app));

export interface SettingsStore {
    app: settings.App;
    saveApp: (app: settings.App) => void;
    saveEditor: (editor: settings.Editor) => void;
}

export const useSettingsStore = (): [SettingsStore, SetStoreFunction<SettingsStore>] => [
    store,
    setStore,
];
