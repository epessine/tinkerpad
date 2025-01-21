import { createStore, SetStoreFunction } from 'solid-js/store';
import { GetData, Save } from '../../wailsjs/go/store/Store';
import { createEffect } from 'solid-js';
import { v4 } from 'uuid';
import { useSettingsStore } from './settings';
import * as models from '../../wailsjs/go/models';
import {
    GetDockerFrameworkInfo,
    GetFrameworkInfo,
    GetRemoteFrameworkInfo,
    RunCode,
    RunDockerCode,
    RunRemoteCode,
} from '../../wailsjs/go/php/Php';
import { AddLog } from '../../wailsjs/go/history/History';
import { ConnExists, RemoveConn } from '../../wailsjs/go/ssh/Ssh';
import { FrameworkInfo } from '../components/StatusBar';

export enum Layout {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

const [settingsStore] = useSettingsStore();

const getDefaultData = () => {
    const tab = getNewTab();

    return { tabs: [tab], currentTabId: tab.id, layout: Layout.Horizontal, showResult: false };
};

const getNewTab = (): Tab => {
    return {
        id: v4(),
        workingDir: settingsStore.app.defaultWorkingDir,
        code: '<?php\n\n',
        loading: false,
        size: 50,
    };
};

const rawData = await GetData(models.store.StoreName.Code);

const newCodeStore: CodeStore = {
    ...(rawData ? JSON.parse(rawData) : getDefaultData()),
    createNewTab(atCurrentPosition: boolean = false) {
        const newTab = getNewTab();
        const currentTabIndex = store.tabs.indexOf(store.currentTab);

        setStore(
            'tabs',
            store.tabs.toSpliced(
                atCurrentPosition ? currentTabIndex + 1 : store.tabs.length,
                0,
                newTab,
            ),
        );
        setStore('currentTabId', newTab.id);
    },
    setCurrentTab(tabId: string) {
        setStore('currentTabId', tabId);
    },
    closeTab(tabId: string) {
        if (store.tabs.length === 1) {
            return;
        }

        if (tabId === store.currentTabId) {
            const tabIndex = store.tabs.findIndex(tab => tab.id === tabId);
            const tabToSwitchIndex = tabIndex === 0 ? tabIndex + 1 : tabIndex - 1;
            store.setCurrentTab(store.tabs[tabToSwitchIndex].id);
        }

        const tab = store.tabs.find(tab => tab.id === tabId);

        if (tab?.sshConn) {
            RemoveConn(tab.sshConn.uuid);
        }

        setStore(
            'tabs',
            store.tabs.filter(tab => tab.id !== tabId),
        );
    },
    setTabCode(tabId: string, code: string) {
        setStore('tabs', tab => tab.id === tabId, 'code', code);
    },
    setTabSize(tabId: string, size: number) {
        setStore('tabs', tab => tab.id === tabId, 'size', size);
    },
    setTabResult(tabId: string, result: string) {
        setStore('tabs', tab => tab.id === tabId, 'result', result);
    },
    setTabLoading(tabId: string, isLoading: boolean) {
        setStore('tabs', tab => tab.id === tabId, 'loading', isLoading);
    },
    setTabWorkingDir(tabId: string, workingDir: string) {
        setStore('tabs', tab => tab.id === tabId, 'workingDir', workingDir);
    },
    setTabSshConnection(tabId: string, sshConn?: SSHConnection) {
        setStore('tabs', tab => tab.id === tabId, 'sshConn', sshConn);
    },
    setTabContainerInfo(tabId: string, info?: models.docker.ContainerInfo) {
        setStore('tabs', tab => tab.id === tabId, 'containerInfo', info);
    },
    toggleLayout() {
        setStore('layout', store.isHorizontalLayout ? Layout.Vertical : Layout.Horizontal);
    },
    toggleResult() {
        setStore('showResult', !store.showResult);
    },
    async getTabFrameworkInfo(tabId: string): Promise<FrameworkInfo> {
        const tab = store.tabs.find(tab => tab.id === tabId)!;

        const info = tab.containerInfo
            ? await GetDockerFrameworkInfo(tab.containerInfo.id)
            : tab.sshConn
              ? await GetRemoteFrameworkInfo(tab.sshConn.uuid)
              : await GetFrameworkInfo(tab.workingDir);

        return JSON.parse(info) as FrameworkInfo;
    },
    async runCode(tab: Tab) {
        store.setTabLoading(tab.id, true);
        AddLog(
            new models.history.HistoryLog({
                uuid: v4(),
                code: tab.code,
                workingDir: tab.workingDir,
                timestamp: Date.now(),
            }),
        );

        const result = tab.containerInfo
            ? await RunDockerCode(tab.containerInfo.id, tab.code)
            : tab.sshConn
              ? await RunRemoteCode(tab.sshConn.uuid, tab.code)
              : await RunCode(tab.workingDir, tab.code);

        store.setTabResult(tab.id, result);
        store.setTabLoading(tab.id, false);
        setStore('showResult', true);
    },
    get currentTab(): Tab {
        return store.tabs.find(tab => tab.id === store.currentTabId)!;
    },
    get isHorizontalLayout() {
        return store.layout === Layout.Horizontal;
    },
};

newCodeStore.tabs = await Promise.all(
    newCodeStore.tabs.map(async t => ({
        ...t,
        sshConn: t.sshConn
            ? (await ConnExists(t.sshConn?.uuid))
                ? t.sshConn
                : undefined
            : undefined,
    })),
);

const [store, setStore] = createStore(newCodeStore);

createEffect(() => Save(models.store.StoreName.Code, JSON.stringify({ ...store })));

export interface CodeStore {
    tabs: Tab[];
    currentTabId: string;
    currentTab: Tab;
    layout: Layout;
    isHorizontalLayout: boolean;
    showResult: boolean;
    createNewTab(atCurrentPosition?: boolean): void;
    setCurrentTab(tabId: string): void;
    closeTab(tabId: string): void;
    setTabCode(tabId: string, code: string): void;
    setTabSize(tabId: string, size: number): void;
    setTabResult(tabId: string, result: string): void;
    setTabLoading(tabId: string, isLoading: boolean): void;
    setTabWorkingDir(tabId: string, workingDir: string): void;
    setTabSshConnection(tabId: string, connection?: SSHConnection): void;
    setTabContainerInfo(tabId: string, info?: models.docker.ContainerInfo): void;
    toggleLayout(): void;
    toggleResult(): void;
    getTabFrameworkInfo(tabId: string): Promise<FrameworkInfo>;
    runCode(tab: Tab): void;
}

export interface SSHConnection {
    uuid: string;
    name: string;
    color: string;
}

export interface Tab {
    id: string;
    workingDir: string;
    code: string;
    result?: string;
    loading: boolean;
    sshConn?: SSHConnection;
    containerInfo?: models.docker.ContainerInfo;
    size?: number;
}

export const useCodeStore = (): [CodeStore, SetStoreFunction<CodeStore>] => [store, setStore];
