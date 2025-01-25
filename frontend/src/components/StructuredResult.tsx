import { Component, createEffect, onMount } from 'solid-js';
import { Layout, Tab, useCodeStore } from '../stores/code';
import { useGeneralStore } from '../stores/general';
import { useSettingsStore } from '../stores/settings';

const StructuredResult: Component<{ tab: Tab }> = props => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();
    const [settingsStore] = useSettingsStore();
    var resultPane!: HTMLDivElement;

    onMount(() => generalStore.setTheme(generalStore.themeInfo.name));

    createEffect(() => {
        try {
            const style = resultPane.querySelector('style')!;
            resultPane.innerHTML = JSON.parse(props.tab.result!)
                .map((v: any) => atob(v.html))
                .join('');

            Array.from(resultPane.querySelectorAll('script')).forEach(oldScriptEl => {
                const newScriptEl = document.createElement('script');

                Array.from(oldScriptEl.attributes).forEach(attr => {
                    newScriptEl.setAttribute(attr.name, attr.value);
                });

                newScriptEl.appendChild(document.createTextNode(oldScriptEl.innerHTML));

                oldScriptEl.parentNode!.replaceChild(newScriptEl, oldScriptEl);
            });

            resultPane.appendChild(style);
        } catch (error) {
            console.error(error);
        }
    });

    return (
        <div
            ref={resultPane}
            classList={{ 'py-2': codeStore.layout === Layout.Horizontal }}
            class="-ml-1 px-3 flex flex-col gap-3 max-h-full overflow-x-hidden overflow-y-auto soft-scrollbar"
        >
            <style>{`
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
            `}</style>
        </div>
    );
};

export default StructuredResult;
