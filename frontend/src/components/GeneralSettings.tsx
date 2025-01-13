import { Component, createSignal, For, Show } from 'solid-js';
import { useSettingsStore } from '../stores/settings';
import { settings } from '../../wailsjs/go/models';
import Input from './Input';
import Button from './Button';
import FolderOpen from './icons/FolderOpen';
import { SelectDir, SelectPhpBinary } from '../../wailsjs/go/dialog/Dialog';
import { IsValidDockerBinaryPath, IsValidPhpBinaryPath } from '../../wailsjs/go/settings/Settings';
import Select from './Select';
import { Theme } from '../utils/editor/themes';
import { useGeneralStore } from '../stores/general';

const GeneralSettings: Component = () => {
    const [generalStore] = useGeneralStore();
    const [settingsStore] = useSettingsStore();
    const [settings, setSettings] = createSignal(settingsStore.app);
    const [theme, setTheme] = createSignal(generalStore.themeInfo.name);
    const [errors, setErrors] = createSignal({} as Record<string, string>);

    const save = () => {
        settingsStore.saveApp(settings());
        setSettings(settingsStore.app);
        generalStore.setTheme(theme());
    };

    const hasErrors = () => Object.values(errors()).some(e => e);
    const isDirty = () => settingsStore.app != settings() || generalStore.themeInfo.name != theme();

    return (
        <div class="py-2 flex flex-col gap-5">
            <Input
                label="PHP Binary Path"
                error={errors().phpBinaryPath}
                value={settings().phpBinaryPath}
                type="text"
                class="pr-12"
                on:input={async e => {
                    const phpBinaryPath = e.currentTarget.value;

                    if (!phpBinaryPath) {
                        setErrors({ ...errors(), phpBinaryPath: 'Invalid PHP binary path' });
                        return;
                    }

                    const isValid = await IsValidPhpBinaryPath(phpBinaryPath);

                    if (!isValid) {
                        setErrors({ ...errors(), phpBinaryPath: 'Invalid PHP binary path' });
                        return;
                    }

                    setSettings({
                        ...settings(),
                        phpBinaryPath: phpBinaryPath,
                    } as settings.App);
                    setErrors({ ...errors(), phpBinaryPath: '' });
                }}
            >
                <FolderOpen
                    on:click={async () => {
                        const dir = await SelectPhpBinary();

                        if (dir) {
                            setSettings({ ...settings(), phpBinaryPath: dir } as settings.App);
                            setErrors({ ...errors(), phpBinaryPath: '' });
                        } else {
                            setErrors({ ...errors(), phpBinaryPath: 'Invalid PHP binary path' });
                        }
                    }}
                    class="absolute right-2 w-4 hover:brightness-125"
                />
            </Input>
            <Input
                label="Docker Binary Path"
                error={errors().dockerBinaryPath}
                value={settings().dockerBinaryPath}
                type="text"
                class="pr-12"
                on:input={async e => {
                    const dockerBinaryPath = e.currentTarget.value;

                    if (!dockerBinaryPath) {
                        setErrors({ ...errors(), dockerBinaryPath: 'Invalid Docker binary path' });
                        return;
                    }

                    const isValid = await IsValidDockerBinaryPath(dockerBinaryPath);

                    if (!isValid) {
                        setErrors({ ...errors(), dockerBinaryPath: 'Invalid Docker binary path' });
                        return;
                    }

                    setSettings({
                        ...settings(),
                        dockerBinaryPath: dockerBinaryPath,
                    } as settings.App);
                    setErrors({ ...errors(), dockerBinaryPath: '' });
                }}
            >
                <FolderOpen
                    on:click={async () => {
                        const dir = await SelectPhpBinary();

                        if (dir) {
                            setSettings({ ...settings(), phpBinaryPath: dir } as settings.App);
                            setErrors({ ...errors(), phpBinaryPath: '' });
                        } else {
                            setErrors({ ...errors(), phpBinaryPath: 'Invalid PHP binary path' });
                        }
                    }}
                    class="absolute right-2 w-4 hover:brightness-125"
                />
            </Input>
            <Input
                label="Auto Complete Service Port"
                error={errors().autoCompletePort}
                value={settings().autoCompletePort}
                type="number"
                on:input={e => {
                    const port = Number(e.currentTarget.value);

                    if (port <= 0 || port > 65535) {
                        setErrors({ ...errors(), autoCompletePort: 'Invalid port' });
                        return;
                    }

                    setSettings({
                        ...settings(),
                        autoCompletePort: Number(e.currentTarget.value),
                    } as settings.App);
                    setErrors({ ...errors(), autoCompletePort: '' });
                }}
            />
            <Input
                label="Default Project"
                value={settings().defaultWorkingDir}
                error={errors().defaultWorkingDir}
                type="text"
                class="pr-12"
                on:input={e => {
                    const dir = e.currentTarget.value;

                    if (dir) {
                        setSettings({
                            ...settings(),
                            defaultWorkingDir: e.currentTarget.value,
                        } as settings.App);
                        setErrors({ ...errors(), defaultWorkingDir: '' });
                    } else {
                        setErrors({ ...errors(), defaultWorkingDir: 'Invalid directory' });
                    }
                }}
            >
                <FolderOpen
                    on:click={async () => {
                        const dir = await SelectDir();

                        if (dir) {
                            setSettings({ ...settings(), defaultWorkingDir: dir } as settings.App);
                        }
                    }}
                    class="absolute right-2 w-4 hover:brightness-125"
                />
            </Input>
            <Select label="Theme" on:input={e => setTheme(e.currentTarget.value as Theme)}>
                <For each={Object.values(Theme).sort()}>
                    {t => <option selected={t === theme()}>{t}</option>}
                </For>
            </Select>
            <div class="mt-3">
                <Button on:click={save} disabled={!isDirty() || hasErrors()}>
                    Save
                </Button>
                <Show when={isDirty() && !hasErrors()}>
                    <span class="italic opacity-60 ml-2">unsaved changes!</span>
                </Show>
            </div>
        </div>
    );
};

export default GeneralSettings;
