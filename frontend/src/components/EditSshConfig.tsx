import { Component, createEffect, createSignal, For, Match, Switch } from 'solid-js';
import { ssh } from '../../wailsjs/go/models';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import FolderOpen from './icons/FolderOpen';
import { Error, Info, SelectFile } from '../../wailsjs/go/dialog/Dialog';
import { createStore } from 'solid-js/store';
import { CheckConnection } from '../../wailsjs/go/ssh/Ssh';
import LoaderCircle from './icons/LoaderCircle';

const EditSshConfig: Component<{
    saveConfig: (config: ssh.SshConnectionConfig, connect?: boolean) => Promise<void>;
    config?: ssh.SshConnectionConfig;
    groups?: ssh.SshConnectionConfigGroup[];
}> = props => {
    const newConfig = () =>
        new ssh.SshConnectionConfig({
            uuid: '',
            name: '',
            color: '',
            host: '',
            port: 22,
            username: '',
            workingDir: '',
            authMethod: ssh.AuthMethod.PrivateKey,
            privateKey: '',
            passphrase: '',
            password: '',
            phpBinaryPath: '',
        });

    const [config, setConfig] = createStore(props.config ?? newConfig());
    const [errors, setErrors] = createSignal({} as Record<string, string>);
    const [connecting, setConnecting] = createSignal(false);

    createEffect(() => setConfig(props.config ? props.config : newConfig()));

    const hasErrors = () =>
        Object.values(errors()).some(e => e) || isMissingRequired() || connecting();
    const isDirty = () =>
        Object.values(config).filter(a => !Object.values(props.config ?? newConfig()).includes(a))
            .length !== 0;

    const isMissingRequired = () =>
        [
            config.name,
            config.host,
            config.port,
            config.username,
            config.workingDir,
            config.phpBinaryPath,
        ]
            .concat(
                config.authMethod === ssh.AuthMethod.PrivateKey
                    ? [config.privateKey]
                    : [config.password],
            )
            .some(v => !v);

    return (
        <div class="py-2 flex flex-col gap-4">
            <div class="flex items-end gap-2">
                <Input
                    label="Name"
                    error={errors().name}
                    value={config.name}
                    type="text"
                    placeholder="My SSH Connection"
                    vertical
                    on:input={e => {
                        const name = e.currentTarget.value;

                        if (name) {
                            setConfig('name', name);
                            setErrors({ ...errors(), name: '' });
                        } else {
                            setErrors({ ...errors(), name: 'Invalid name' });
                        }
                    }}
                />
                <div class="w-16">
                    <Input
                        error={errors().color}
                        value={config.color}
                        label="Color"
                        type="color"
                        class="h-[33px]"
                        placeholder="My SSH Connection"
                        vertical
                        on:input={e => {
                            const color = e.currentTarget.value;

                            if (color) {
                                setConfig('color', color);
                                setErrors({ ...errors(), color: '' });
                            } else {
                                setErrors({ ...errors(), color: 'Invalid color' });
                            }
                        }}
                    />
                </div>
            </div>
            <Select
                vertical
                label="Group"
                disabled={!props.groups?.length}
                on:input={e => {
                    setConfig('groupUuid', e.currentTarget.value);
                    setConfig(
                        'color',
                        props.groups?.find(g => g.uuid === config.groupUuid)?.color ?? '#fff',
                    );
                }}
            >
                <option value="">No group</option>
                <For each={props.groups?.sort()}>
                    {group => (
                        <option selected={group.uuid === config.groupUuid} value={group.uuid}>
                            {group.name}
                        </option>
                    )}
                </For>
            </Select>
            <div class="flex gap-2 w-full">
                <Input
                    label="Host"
                    error={errors().host}
                    value={config.host}
                    type="text"
                    placeholder="123.12.12.12"
                    vertical
                    on:input={e => {
                        const host = e.currentTarget.value;

                        if (host) {
                            setConfig('host', host);
                            setErrors({ ...errors(), host: '' });
                        } else {
                            setErrors({ ...errors(), host: 'Invalid host' });
                        }
                    }}
                />
                <Input
                    label="Port"
                    error={errors().port}
                    value={config.port}
                    type="number"
                    vertical
                    on:input={e => {
                        const port = Number(e.currentTarget.value);

                        if (port <= 0 || port > 65535) {
                            setErrors({ ...errors(), port: 'Invalid port' });
                            return;
                        }

                        setConfig('port', port);
                        setErrors({ ...errors(), port: '' });
                    }}
                />
            </div>
            <div class="flex gap-2 w-full">
                <Input
                    label="Username"
                    error={errors().username}
                    value={config.username}
                    placeholder="myuser"
                    type="text"
                    vertical
                    on:input={e => {
                        const username = e.currentTarget.value;

                        if (username) {
                            setConfig('username', username);
                            setErrors({ ...errors(), username: '' });
                        } else {
                            setErrors({ ...errors(), username: 'Invalid username' });
                        }
                    }}
                />
                <Input
                    label="Directory"
                    placeholder="/home/app/"
                    error={errors().workingDir}
                    value={config.workingDir}
                    type="text"
                    vertical
                    on:input={e => {
                        const workingDir = e.currentTarget.value;

                        if (workingDir) {
                            setConfig('workingDir', workingDir);
                            setErrors({ ...errors(), workingDir: '' });
                        } else {
                            setErrors({ ...errors(), workingDir: 'Invalid directory' });
                        }
                    }}
                />
            </div>
            <Select
                vertical
                label="Authentication Method"
                on:input={e => {
                    setConfig('authMethod', e.currentTarget.value as ssh.AuthMethod);
                    if (config.authMethod === ssh.AuthMethod.PrivateKey) {
                        setConfig('password', '');
                    } else {
                        setConfig('privateKey', '');
                        setConfig('passphrase', '');
                    }
                }}
            >
                <For each={Object.values(ssh.AuthMethod).sort()}>
                    {method => (
                        <option selected={method === config.authMethod} value={method}>
                            {method === ssh.AuthMethod.PrivateKey ? 'Private Key' : 'Password'}
                        </option>
                    )}
                </For>
            </Select>
            <Switch>
                <Match when={config.authMethod == ssh.AuthMethod.PrivateKey}>
                    <div class="flex flex-col gap-4">
                        <Input
                            label="Private Key"
                            value={config.privateKey}
                            error={errors().privateKey}
                            type="text"
                            placeholder="/Users/myuser/.ssh/id_rsa"
                            class="pr-12"
                            vertical
                            on:input={e => {
                                const keyPath = e.currentTarget.value;

                                if (keyPath) {
                                    setConfig('privateKey', keyPath);
                                    setErrors({ ...errors(), privateKey: '' });
                                } else {
                                    setErrors({ ...errors(), privateKey: 'Invalid key' });
                                }
                            }}
                        >
                            <FolderOpen
                                on:click={async () => {
                                    const keyPath = await SelectFile();

                                    if (keyPath) {
                                        setConfig('privateKey', keyPath);
                                        setErrors({ ...errors(), privateKey: '' });
                                    } else {
                                        setErrors({ ...errors(), privateKey: 'Invalid key' });
                                    }
                                }}
                                class="absolute right-2 top-[27px] w-4 hover:brightness-125"
                            />
                        </Input>
                        <Input
                            label="Passphrase"
                            value={config.passphrase}
                            type="password"
                            placeholder="Key passphrase"
                            vertical
                            on:input={e => setConfig('passphrase', e.currentTarget.value)}
                        />
                    </div>
                </Match>
                <Match when={config.authMethod == ssh.AuthMethod.Password}>
                    <Input
                        label="Password"
                        value={config.password}
                        type="password"
                        placeholder="Password"
                        vertical
                        on:input={e => setConfig('password', e.currentTarget.value)}
                    />
                </Match>
            </Switch>
            <Input
                label="PHP Binary Path"
                error={errors().phpBinaryPath}
                value={config.phpBinaryPath}
                placeholder="/Users/myuser/bin/php"
                type="text"
                vertical
                on:input={e => {
                    const phpBinaryPath = e.currentTarget.value;

                    if (phpBinaryPath) {
                        setConfig('phpBinaryPath', phpBinaryPath);
                        setErrors({ ...errors(), phpBinaryPath: '' });
                    } else {
                        setErrors({ ...errors(), phpBinaryPath: 'Invalid path' });
                    }
                }}
            />
            <div class="flex justify-between">
                <div class="flex gap-2 mt-3">
                    <Button
                        on:click={async () => {
                            setConnecting(true);
                            try {
                                await props.saveConfig(config, true);
                            } catch (error) {
                                Error(`Connection error: ${error}`);
                            }
                            setConnecting(false);
                        }}
                        disabled={hasErrors()}
                        class="whitespace-nowrap"
                    >
                        {config.uuid && !isDirty() ? 'Connect' : 'Save & Connect'}
                    </Button>
                    <Button
                        on:click={() => props.saveConfig(config)}
                        disabled={hasErrors() || !isDirty()}
                        class="whitespace-nowrap"
                    >
                        Save
                    </Button>
                </div>
                <div class="flex gap-2 mt-3">
                    <Button
                        on:click={async () => {
                            setConnecting(true);
                            try {
                                await CheckConnection(config);
                                Info('Connection successful!');
                            } catch (error) {
                                Error(`Connection error: ${error}`);
                            }
                            setConnecting(false);
                        }}
                        disabled={hasErrors()}
                        class="whitespace-nowrap"
                    >
                        {connecting() ? (
                            <span>
                                <LoaderCircle class="w-4 inline mr-1 -mt-0.5 animate-spin" />
                                Connecting...
                            </span>
                        ) : (
                            'Test Connection'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditSshConfig;
