import { Component, createResource, createSignal, For, Show } from 'solid-js';
import { useGeneralStore } from '../stores/general';
import Star from './icons/Star';
import Plus from './icons/Plus';
import { GetAll, Save } from '../../wailsjs/go/favorites/Favorites';
import { favorites } from '../../wailsjs/go/models';
import NewFavorite from './NewFavorite';
import ViewFavorite from './ViewFavorite';
import Trash from './icons/Trash';
import { Confirm } from '../../wailsjs/go/dialog/Dialog';

const Favorites: Component = () => {
    const [selectedFavorite, setSelectedFavorite] = createSignal<favorites.Favorite | undefined>(
        undefined,
    );
    const [selectedProject, setSelectedProject] = createSignal('');
    const [favorites, { mutate, refetch }] = createResource(async () => await GetAll());
    const [generalStore] = useGeneralStore();

    const saveFavorite = async (favorite: favorites.Favorite) => {
        mutate([...favorites()!, favorite]);
        await Save(favorites()!);
        await refetch();
        setSelectedFavorite(favorites()?.find(f => f.uuid === favorite.uuid));
    };

    const deleteFavorite = async (favorite: favorites.Favorite) => {
        mutate(favorites()?.filter(f => f.uuid !== favorite.uuid));
        await Save(favorites()!);
        await refetch();
        if (selectedFavorite()?.uuid === favorite.uuid) {
            setSelectedFavorite(undefined);
        }
    };

    return (
        <div
            class="flex grow px-20 py-6 text-sm border-y cursor-default select-none max-h-full"
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
                    <Star class="h-5 w-5 inline mr-1.5 -mt-0.5 transition-all duration-75" />
                    Favorites
                </h1>

                <div
                    on:click={() => setSelectedFavorite(undefined)}
                    classList={{
                        'font-bold brightness-105 -ml-1': selectedFavorite() === undefined,
                        'hover:brightness-125': selectedFavorite() !== undefined,
                    }}
                >
                    <Plus class="w-4 mr-1 -mt-0.5 inline" />
                    Add favorite
                </div>
                <hr
                    class="my-2 -mx-3"
                    style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
                />
                <Show when={favorites()?.length}>
                    <select
                        on:input={e => setSelectedProject(e.currentTarget.value)}
                        class="rounded-lg px-2 py-1.5 w-full h-7 bg-transparent mb-2"
                    >
                        <option value="">All projects</option>
                        <For each={[...new Set(favorites()?.map(p => p.workingDir))]}>
                            {project => (
                                <option selected={selectedProject() === project} value={project}>
                                    {project}
                                </option>
                            )}
                        </For>
                    </select>
                </Show>
                <div class="flex flex-col max-h-[65%] overflow-y-auto soft-scrollbar">
                    <For
                        each={favorites()?.filter(f =>
                            selectedProject() ? f.workingDir === selectedProject() : f,
                        )}
                        fallback={<div>No favorites added yet.</div>}
                    >
                        {favorite => (
                            <div class="flex items-center justify-between gap-3 group min-h-7 w-full pr-2">
                                <div
                                    on:click={() => setSelectedFavorite(favorite)}
                                    class="max-w-[80%] w-[80%] truncate"
                                    classList={{
                                        'font-bold brightness-105':
                                            selectedFavorite()?.uuid === favorite.uuid,
                                        'hover:brightness-125':
                                            selectedFavorite()?.uuid !== favorite.uuid,
                                    }}
                                >
                                    {favorite.name}
                                </div>
                                <span
                                    on:click={async e => {
                                        e.stopPropagation();
                                        (await Confirm(
                                            'Are you sure you want to delete this favorite?',
                                        )) && deleteFavorite(favorite);
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
                <Show
                    keyed
                    when={selectedFavorite()}
                    fallback={<NewFavorite saveFavorite={saveFavorite} />}
                >
                    {favorite => <ViewFavorite favorite={favorite} />}
                </Show>
            </div>
        </div>
    );
};

export default Favorites;
