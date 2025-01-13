import { Component, createSignal, Show } from 'solid-js';
import { useSettingsStore } from '../stores/settings';
import Input from './Input';
import { settings } from '../../wailsjs/go/models';
import Button from './Button';

const EditorSettings: Component = () => {
    const [settingsStore] = useSettingsStore();
    const [settings, setSettings] = createSignal(settingsStore.app.editor);
    const [errors, setErrors] = createSignal({} as Record<string, string>);

    const save = () => {
        settingsStore.saveEditor(settings());
        setSettings(settingsStore.app.editor);
    };

    const hasErrors = () => Object.values(errors()).some(e => e);

    return (
        <div class="py-2 flex flex-col gap-5">
            <Input
                label="Font Family"
                error={errors().fontFamily}
                value={settings().fontFamily}
                type="text"
                on:input={e => {
                    const fontFamily = e.currentTarget.value;

                    if (!fontFamily) {
                        setErrors({ ...errors(), fontFamily: 'Invalid value' });
                        return;
                    }

                    setSettings({ ...settings(), fontFamily: fontFamily } as settings.Editor);
                    setErrors({ ...errors(), fontFamily: '' });
                }}
            />
            <Input
                label="Font Size"
                error={errors().fontSize}
                value={settings().fontSize}
                type="number"
                on:input={e => {
                    const size = Number(e.currentTarget.value);

                    if (size <= 10 || size > 20) {
                        setErrors({ ...errors(), fontSize: 'Invalid value' });
                        return;
                    }

                    setSettings({ ...settings(), fontSize: size } as settings.Editor);
                    setErrors({ ...errors(), fontSize: '' });
                }}
            />
            <Input
                label="Line Height"
                error={errors().lineHeight}
                value={settings().lineHeight}
                type="number"
                step={0.1}
                on:input={e => {
                    const size = Number(e.currentTarget.value);

                    if (size <= 0) {
                        setErrors({ ...errors(), lineHeight: 'Invalid value' });
                        return;
                    }

                    setSettings({ ...settings(), lineHeight: size } as settings.Editor);
                    setErrors({ ...errors(), lineHeight: '' });
                }}
            />
            <Input
                label="Word Wrap"
                error={errors().wordWrap}
                checked={settings().wordWrap}
                type="checkbox"
                class="w-min mr-1 my-2.5"
                step={0.1}
                on:input={e => {
                    const value = e.currentTarget.checked;

                    setSettings({ ...settings(), wordWrap: value } as settings.Editor);
                    setErrors({ ...errors(), wordWrap: '' });
                }}
            />
            <Input
                label="Line Numbers"
                error={errors().lineNumbers}
                checked={settings().lineNumbers}
                type="checkbox"
                class="w-min mr-1 my-2.5"
                step={0.1}
                on:input={e => {
                    const value = e.currentTarget.checked;

                    setSettings({ ...settings(), lineNumbers: value } as settings.Editor);
                    setErrors({ ...errors(), lineNumbers: '' });
                }}
            />
            <div class="mt-3">
                <Button
                    on:click={save}
                    disabled={settingsStore.app.editor == settings() || hasErrors()}
                >
                    Save
                </Button>
                <Show when={settingsStore.app.editor != settings() && !hasErrors()}>
                    <span class="italic opacity-60 ml-2">unsaved changes!</span>
                </Show>
            </div>
        </div>
    );
};

export default EditorSettings;
