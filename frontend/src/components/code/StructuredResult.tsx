import { Component, createEffect, onMount } from 'solid-js';
import { Layout, TabResult, useCodeStore } from '../../stores/code';
import { useGeneralStore } from '../../stores/general';
import { useSettingsStore } from '../../stores/settings';

const StructuredResult: Component<{ result: TabResult }> = props => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();
    const [settingsStore] = useSettingsStore();
    const style = `
        pre.sf-dump * {
            font-family: ${settingsStore.app.editor.fontFamily} !important;
            font-size: ${settingsStore.app.editor.fontSize}px !important;
        }
        pre.sf-dump, pre.sf-dump .sf-dump-default {
            color: ${generalStore.themeInfo.colors.editor.keyword};
            padding: 1rem;
            background-color: color-mix(in srgb, ${generalStore.themeInfo.colors.secondary}, ${generalStore.themeInfo.colors.background} 60%);
        }
        .sf-dump-hover:hover {
            background-color: ${generalStore.themeInfo.colors.secondary};
        }
        pre.sf-dump .sf-dump-key {
            color: ${generalStore.themeInfo.colors.editor.string};
        }
        pre.sf-dump .sf-dump-str {
            color: ${generalStore.themeInfo.colors.editor.string};
        }
        pre.sf-dump .sf-dump-num {
            color: ${generalStore.themeInfo.colors.primary};
        }
        pre.sf-dump .sf-dump-index {
            color: ${generalStore.themeInfo.colors.primary};
        }
        pre.sf-dump .sf-dump-note {
            color: ${generalStore.themeInfo.colors.primary};
        }
        pre.sf-dump .sf-dump-ellipsis-note {
            color: ${generalStore.themeInfo.colors.primary};
        }
        pre.sf-dump .sf-dump-const {
            color: ${generalStore.themeInfo.colors.editor.keyword};
        }
        pre.sf-dump .sf-dump-protected,
        pre.sf-dump .sf-dump-public,
        pre.sf-dump .sf-dump-private,
        pre.sf-dump .sf-dump-meta {
            color: ${generalStore.themeInfo.colors.editor.variable};
        }
    `;
    var resultPane!: HTMLDivElement;

    onMount(() => generalStore.setTheme(generalStore.themeInfo.name));

    createEffect(() => {
        try {
            const outputs =
                typeof props.result === 'string' ? JSON.parse(props.result) : props.result.outputs;

            resultPane.innerHTML = outputs.map((v: any) => atob(v.html)).join('');

            const styleEl = document.createElement('style');
            styleEl.innerHTML = style;
            resultPane.appendChild(styleEl);

            Array.from(resultPane.querySelectorAll('.sf-dump')).forEach(dump =>
                window.Sfdump(dump.id),
            );
        } catch (error) {
            console.error(error);
        }
    });

    return (
        <div
            ref={resultPane}
            classList={{ 'py-2': codeStore.layout === Layout.Horizontal }}
            class="-ml-1 px-3 flex flex-col gap-3 max-h-full overflow-x-hidden overflow-y-auto soft-scrollbar"
        ></div>
    );
};

export default StructuredResult;
