import { Component, createResource, createSignal, Show } from 'solid-js';
import { GetAppVersion } from '../../wailsjs/go/settings/Settings';
import Input from './Input';
import { useUpdateStore } from '../stores/update';
import Button from './Button';
import LoaderCircle from './icons/LoaderCircle';
import { DownloadUpdate } from '../../wailsjs/go/updater/Updater';
import { Info } from '../../wailsjs/go/dialog/Dialog';
import { Quit } from '../../wailsjs/runtime/runtime';

const UpdateSettings: Component = () => {
    const [appVersion] = createResource(async () => await GetAppVersion());
    const [updateStore] = useUpdateStore();
    const [isDownloading, setIsDownloading] = createSignal(false);

    return (
        <div class="py-2 flex flex-col gap-5">
            <Input value={appVersion()} label="Current Version" disabled />
            <Show when={updateStore.hasUpdate}>
                <div>
                    <Input value={updateStore.info?.version} label="Latest Version" disabled />
                </div>
            </Show>
            <Show
                when={updateStore.hasUpdate}
                fallback={<div class="opacity-50">You're up-to-date.</div>}
            >
                <div class="mt-3 flex gap-2 items-center">
                    <Button
                        disabled={isDownloading()}
                        on:click={async () => {
                            setIsDownloading(true);
                            try {
                                await DownloadUpdate(updateStore.info!.url);
                                Quit();
                            } catch (error) {
                                Info('Error downloading update.');
                            }
                            setIsDownloading(false);
                        }}
                        class="whitespace-nowrap"
                    >
                        Update
                    </Button>
                    <Show when={isDownloading()}>
                        <LoaderCircle class="w-4 animate-spin" />
                    </Show>
                </div>
            </Show>
        </div>
    );
};

export default UpdateSettings;
