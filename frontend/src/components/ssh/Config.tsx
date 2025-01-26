import { Component, createResource, createSignal, For, Show } from 'solid-js';
import { Screen, useGeneralStore } from '../../stores/general';
import Plus from '../icons/Plus';
import Trash from '../icons/Trash';
import { Confirm } from '../../../wailsjs/go/dialog/Dialog';
import Server from '../icons/Server';
import SaveIcon from '../icons/Save';
import { useCodeStore } from '../../stores/code';
import StatusBar from '../code/status-bar/StatusBar';
import { Connect, GetAll, Save } from '../../../wailsjs/go/ssh/Ssh';
import { ssh } from '../../../wailsjs/go/models';
import Edit from './Edit';
import Input from '../Input';
import Ban from '../icons/Ban';
import { v4 } from 'uuid';

const Config: Component = () => {
    let groupNameInput!: HTMLInputElement;
    let groupColorInput!: HTMLInputElement;
    const [selectedConfig, setSelectedConfig] = createSignal<ssh.SshConnectionConfig | undefined>(
        undefined,
    );
    const [creatingGroup, setCreatingGroup] = createSignal(false);
    const [selectedGroup, setSelectedGroup] = createSignal('');
    const [data, { mutate, refetch }] = createResource(async () => await GetAll());
    const [generalStore] = useGeneralStore();
    const [codeStore] = useCodeStore();

    const saveConfig = async (config: ssh.SshConnectionConfig, connect: boolean = false) => {
        config.uuid ||= v4();
        const newConfigs = data()
            ?.configs.filter(c => c.uuid !== config.uuid)
            .concat([config]);
        mutate(d => new ssh.Data({ ...d, configs: newConfigs }));
        await Save(data()!);
        await refetch();

        config = data()?.configs.find(c => c.uuid === config.uuid)!;
        setSelectedConfig(config);

        if (!connect) {
            return;
        }

        const connUuid = await Connect(config);
        codeStore.setTabSshConnection(codeStore.currentTabId, {
            uuid: connUuid,
            name: config.name,
            color: config.color,
        });
        if (codeStore.currentTab.containerInfo) {
            codeStore.setTabContainerInfo(codeStore.currentTabId);
        }
        generalStore.setCurrentScreen(Screen.Code);
    };

    const deleteConfig = async (config: ssh.SshConnectionConfig) => {
        mutate(
            d =>
                new ssh.Data({
                    ...d,
                    configs: data()?.configs.filter(c => c.uuid !== config.uuid),
                }),
        );
        await Save(data()!);
        await refetch();
        if (selectedConfig()?.uuid === config.uuid) {
            setSelectedConfig(undefined);
        }
    };

    const saveGroup = async (group: ssh.SshConnectionConfigGroup) => {
        const newGroups = data()
            ?.groups.filter(c => c.uuid !== group.uuid)
            .concat([group]);
        mutate(d => new ssh.Data({ ...d, groups: newGroups }));
        await Save(data()!);
        await refetch();
        setSelectedGroup(group.uuid);
    };

    const deleteGroup = async (groupUuid: string) => {
        mutate(
            d =>
                new ssh.Data({
                    ...d,
                    groups: data()?.groups.filter(g => g.uuid !== groupUuid),
                    configs: data()?.configs.filter(c => c.groupUuid !== groupUuid),
                }),
        );
        await Save(data()!);
        await refetch();
        if (selectedGroup() === groupUuid) {
            setSelectedGroup('');
        }
    };

    return (
        <div class="flex flex-col grow max-h-full">
            <div
                class="flex grow px-20 py-6 text-sm border-t cursor-default select-none max-h-full"
                style={{
                    'background-color': generalStore.themeInfo.colors.background,
                    color: generalStore.themeInfo.colors.primary,
                    'border-color': generalStore.themeInfo.colors.secondary,
                }}
            >
                <div
                    class="flex flex-col gap-2 border-r px-7 min-w-[30%] max-w-[30%]"
                    style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                >
                    <h1 class="text-lg mb-5 font-semibold drop-shadow">
                        <Server class="h-5 w-5 inline mr-1.5 -mt-0.5 transition-all duration-75" />
                        SSH
                    </h1>

                    <div
                        on:click={() => setSelectedConfig(undefined)}
                        classList={{
                            'font-bold brightness-105 -ml-1': selectedConfig() === undefined,
                            'hover:brightness-125': selectedConfig() !== undefined,
                        }}
                    >
                        <Plus class="w-4 mr-1 -mt-0.5 inline" />
                        Add connection
                    </div>
                    <hr
                        class="my-2 -mx-3"
                        style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                    />
                    <div>
                        <Show
                            when={creatingGroup()}
                            fallback={
                                <div
                                    on:click={() => setCreatingGroup(true)}
                                    class="hover:brightness-125 py-1"
                                >
                                    <Plus class="w-4 mr-1 -mt-0.5 inline" />
                                    Add group
                                </div>
                            }
                        >
                            <div class="space-y-3">
                                <div class="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        class="h-8"
                                        ref={groupColorInput}
                                        vertical
                                    />
                                    <Input ref={groupNameInput} vertical />
                                </div>
                                <div class="flex gap-3 justify-end">
                                    <SaveIcon
                                        on:click={() => {
                                            groupNameInput.value &&
                                                saveGroup(
                                                    new ssh.SshConnectionConfigGroup({
                                                        uuid: v4(),
                                                        name: groupNameInput.value,
                                                        color: groupColorInput.value,
                                                    }),
                                                );
                                            setCreatingGroup(false);
                                        }}
                                        class="w-5 hover:brightness-125"
                                    />
                                    <Ban
                                        on:click={() => setCreatingGroup(false)}
                                        class="w-5 hover:brightness-125"
                                    />
                                </div>
                            </div>
                        </Show>
                    </div>
                    <hr
                        class="my-2 -mx-3"
                        style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                    />
                    <Show when={data()?.groups.length}>
                        <div class="flex gap-3 items-center">
                            <select
                                on:input={e => setSelectedGroup(e.currentTarget.value)}
                                class="rounded-lg px-2 py-1.5 w-full h-7 bg-transparent mb-2"
                            >
                                <option value="">All groups</option>
                                <For each={data()?.groups}>
                                    {group => (
                                        <option
                                            style={{ 'background-color': group.color }}
                                            selected={selectedGroup() === group.uuid}
                                            value={group.uuid}
                                        >
                                            {group.name}
                                        </option>
                                    )}
                                </For>
                            </select>
                            <Show when={selectedGroup()}>
                                <div class="flex gap-2 items-center -mt-2.5">
                                    <div
                                        class="h-5 aspect-square rounded-full mt-0.5 drop-shadow-md"
                                        style={{
                                            'background-color': data()?.groups.find(
                                                g => g.uuid === selectedGroup(),
                                            )?.color,
                                        }}
                                    ></div>
                                    <Trash
                                        on:click={async e => {
                                            e.stopPropagation();
                                            (await Confirm(
                                                "Are you sure you want to delete this group and ALL it's connections?",
                                            )) && deleteGroup(selectedGroup());
                                        }}
                                        class="w-5 hover:brightness-125"
                                    />
                                </div>
                            </Show>
                        </div>
                    </Show>
                    <div class="flex flex-col max-h-[65%] overflow-y-auto soft-scrollbar">
                        <For
                            each={data()?.configs.filter(c =>
                                selectedGroup() ? c.groupUuid === selectedGroup() : c,
                            )}
                            fallback={<div>No SSH connections added yet.</div>}
                        >
                            {config => (
                                <div class="flex items-center justify-between gap-3 group min-h-7 w-full pr-2">
                                    <div
                                        on:click={() => setSelectedConfig(config)}
                                        class="max-w-[80%] w-[80%] truncate"
                                        classList={{
                                            'font-bold brightness-105':
                                                selectedConfig()?.uuid === config.uuid,
                                            'hover:brightness-125':
                                                selectedConfig()?.uuid !== config.uuid,
                                        }}
                                    >
                                        {config.name}
                                        <span
                                            class="h-3 -mt-0.5 ml-2 align-middle aspect-square inline-block rounded-full drop-shadow-md"
                                            style={{ 'background-color': config.color }}
                                        ></span>
                                    </div>
                                    <span
                                        on:click={async e => {
                                            e.stopPropagation();
                                            (await Confirm(
                                                'Are you sure you want to delete this connection?',
                                            )) && deleteConfig(config);
                                        }}
                                    >
                                        <Trash class="w-3.5 align-middle hidden group-hover:block hover:brightness-125" />
                                    </span>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
                <div class="grow px-7">
                    <Edit
                        config={selectedConfig()}
                        saveConfig={saveConfig}
                        groups={data()?.groups}
                    />
                </div>
            </div>
            <Show when={codeStore.currentTab} keyed>
                {tab => <StatusBar tab={tab} />}
            </Show>
        </div>
    );
};

export default Config;
