import { createStore, SetStoreFunction } from 'solid-js/store';
import { EventsOn } from '../../wailsjs/runtime/runtime';

export interface UpdateInfo {
    version: string;
    body: string;
    url: string;
}

export interface UpdateStore {
    hasUpdate: boolean;
    info?: UpdateInfo;
}

const [store, setStore] = createStore<UpdateStore>({
    hasUpdate: false,
    info: undefined,
});

EventsOn('update-available', (info: UpdateInfo) => {
    setStore('info', info);
    setStore('hasUpdate', true);
});

export const useUpdateStore = (): [UpdateStore, SetStoreFunction<UpdateStore>] => [store, setStore];
