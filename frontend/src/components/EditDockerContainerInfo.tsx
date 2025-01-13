import { Component, createSignal, Show } from 'solid-js';
import { docker } from '../../wailsjs/go/models';
import Input from './Input';
import Button from './Button';
import { Error, Info } from '../../wailsjs/go/dialog/Dialog';
import FolderSearch from './icons/FolderSearch';
import { createTooltip } from '../utils/tooltip/create';
import { GetContainerPhpBinaryPath, GetContainerWorkingDir } from '../../wailsjs/go/docker/Docker';
import LoaderCircle from './icons/LoaderCircle';

const EditDockerContainerInfo: Component<{
    saveInfo: (info: docker.ContainerInfo, connect?: boolean) => Promise<void>;
    info: docker.ContainerInfo;
}> = props => {
    const [workingDir, setWorkingDir] = createSignal(props.info.workingDir);
    const [phpBinaryPath, setPhpBinaryPath] = createSignal(props.info.phpBinaryPath);
    const [errors, setErrors] = createSignal({} as Record<string, string>);
    const [connecting, setConnecting] = createSignal(false);

    const hasErrors = () =>
        Object.values(errors()).some(e => e) || isMissingRequired() || connecting();
    const isDirty = () =>
        workingDir() !== props.info.workingDir || phpBinaryPath() !== props.info.phpBinaryPath;

    const isMissingRequired = () => !workingDir() || !phpBinaryPath();

    createTooltip('#dir-auto-detect', 'Auto-detect');
    createTooltip('#php-auto-detect', 'Auto-detect');

    return (
        <div class="py-2 flex flex-col gap-4">
            <div class="flex w-full gap-2">
                <Input label="ID" value={props.info.id} type="text" disabled vertical />
                <Input label="Name" value={props.info.name} type="text" disabled vertical />
            </div>
            <div class="relative">
                <Input
                    label="Directory"
                    placeholder="/home/app/"
                    error={errors().workingDir}
                    value={workingDir()}
                    type="text"
                    vertical
                    on:input={e => {
                        const workingDir = e.currentTarget.value;

                        if (workingDir) {
                            setWorkingDir(workingDir);
                            setErrors({ ...errors(), workingDir: '' });
                        } else {
                            setErrors({ ...errors(), workingDir: 'Invalid directory' });
                        }
                    }}
                />
                <FolderSearch
                    on:click={async () => {
                        try {
                            const dir = await GetContainerWorkingDir(props.info);
                            setWorkingDir(dir);
                        } catch (error) {
                            Info('Could not find project directory');
                        }
                    }}
                    id="dir-auto-detect"
                    class="w-5 absolute top-7 right-3 hover:brightness-125"
                />
            </div>
            <div class="relative">
                <Input
                    label="PHP Binary Path"
                    error={errors().phpBinaryPath}
                    value={phpBinaryPath()}
                    placeholder="/Users/myuser/bin/php"
                    type="text"
                    vertical
                    on:input={e => {
                        const phpBinaryPath = e.currentTarget.value;

                        if (phpBinaryPath) {
                            setPhpBinaryPath(phpBinaryPath);
                            setErrors({ ...errors(), phpBinaryPath: '' });
                        } else {
                            setErrors({ ...errors(), phpBinaryPath: 'Invalid path' });
                        }
                    }}
                />
                <FolderSearch
                    on:click={async () => {
                        try {
                            const phpPath = await GetContainerPhpBinaryPath(props.info);
                            setPhpBinaryPath(phpPath);
                        } catch (error) {
                            Info('Could not find PHP path');
                        }
                    }}
                    id="php-auto-detect"
                    class="w-5 absolute top-7 right-3 hover:brightness-125"
                />
            </div>
            <div class="flex items-center justify-between gap-2 mt-3">
                <div class="flex">
                    <Button
                        on:click={async () => {
                            setConnecting(true);
                            try {
                                await props.saveInfo(
                                    new docker.ContainerInfo({
                                        id: props.info.id,
                                        name: props.info.name,
                                        workingDir: workingDir(),
                                        phpBinaryPath: phpBinaryPath(),
                                    }),
                                    true,
                                );
                            } catch (error) {
                                Error(`Connection error: ${error}`);
                            }
                            setConnecting(false);
                        }}
                        disabled={hasErrors()}
                        class="whitespace-nowrap"
                    >
                        {!isDirty() ? 'Connect' : 'Save & Connect'}
                    </Button>
                    <Button
                        on:click={() =>
                            props.saveInfo(
                                new docker.ContainerInfo({
                                    id: props.info.id,
                                    name: props.info.name,
                                    workingDir: workingDir(),
                                    phpBinaryPath: phpBinaryPath(),
                                }),
                            )
                        }
                        disabled={hasErrors() || !isDirty()}
                        class="whitespace-nowrap"
                    >
                        Save
                    </Button>
                </div>
                <div>
                    <Show when={connecting()}>
                        <div class="opacity-50 float-end">
                            <LoaderCircle class="w-4 inline mr-1 -mt-0.5 animate-spin" />
                            Connecting...
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default EditDockerContainerInfo;
