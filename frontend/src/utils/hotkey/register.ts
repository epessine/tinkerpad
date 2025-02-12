import { onCleanup, onMount } from 'solid-js';
import { useCodeStore } from '../../stores/code';
import { useGeneralStore } from '../../stores/general';

type OptionalConfig = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey'>;

interface HotkeyConfig extends Partial<OptionalConfig> {
    key: KeyboardEvent['key'];
    targetElement?: HTMLElement;
}

type HotkeyAction = (e: KeyboardEvent) => void;

const [codeStore] = useCodeStore();
const [generalStore] = useGeneralStore();

const registerHotkey = (action: HotkeyAction, config: HotkeyConfig) => {
    const targetElement = config.targetElement || document;

    const eventHandler = (e: KeyboardEvent) => {
        const { key, ctrlKey, altKey, shiftKey, metaKey } = e;
        if (config.key !== key) return;
        if (config.ctrlKey && !ctrlKey) return;
        if (config.shiftKey && !shiftKey) return;
        if (config.altKey && !altKey) return;
        if (config.metaKey && !metaKey) return;

        e.preventDefault();
        action(e);
    };

    onMount(() => targetElement.addEventListener('keydown', eventHandler as EventListener));
    onCleanup(() => targetElement.removeEventListener('keydown', eventHandler as EventListener));
};

const registerHotkeys = () => {
    registerHotkey(() => codeStore.currentTab.loading || codeStore.runCode(codeStore.currentTab), {
        key: 'r',
        metaKey: !generalStore.isLinux,
        ctrlKey: generalStore.isLinux,
    });
    registerHotkey(() => codeStore.createNewTab(true), {
        key: 't',
        metaKey: !generalStore.isLinux,
        ctrlKey: generalStore.isLinux,
    });
    registerHotkey(() => codeStore.closeTab(codeStore.currentTabId), {
        key: 'w',
        metaKey: !generalStore.isLinux,
        ctrlKey: generalStore.isLinux,
    });
    registerHotkey(codeStore.toggleLayout, { key: 'l', ctrlKey: true });
    registerHotkey(codeStore.toggleResult, { key: 'u', ctrlKey: true });
};

export { registerHotkeys };
