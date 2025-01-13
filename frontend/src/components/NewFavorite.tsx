import { Component, createSignal } from 'solid-js';
import { favorites } from '../../wailsjs/go/models';
import Input from './Input';
import { useCodeStore } from '../stores/code';
import FavoriteCode from './FavoriteCode';
import { useGeneralStore } from '../stores/general';
import Button from './Button';
import { v4 } from 'uuid';

const NewFavorite: Component<{
    saveFavorite: (favorite: favorites.Favorite) => Promise<void>;
}> = props => {
    const [name, setName] = createSignal('');
    const [errors, setErrors] = createSignal({} as Record<string, string>);
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();

    return (
        <div class="py-2 flex flex-col gap-5">
            <Input
                label="Name"
                error={errors().name}
                value={name()}
                type="text"
                class="!max-w-[90%]"
                on:input={e => {
                    const name = e.currentTarget.value;

                    if (name) {
                        setName(name);
                        setErrors({ ...errors(), name: '' });
                    } else {
                        setErrors({ ...errors(), name: 'Invalid name' });
                    }
                }}
            />
            <Input
                label="Project"
                value={codeStore.currentTab.workingDir}
                type="text"
                disabled
                class="!max-w-[90%]"
            />
            <div
                class="h-96 border"
                style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            >
                <FavoriteCode tab={codeStore.currentTab} />
            </div>
            <Button
                on:click={() =>
                    props.saveFavorite(
                        new favorites.Favorite({
                            uuid: v4(),
                            name: name(),
                            code: codeStore.currentTab.code,
                            workingDir: codeStore.currentTab.workingDir,
                            timestamp: Date.now(),
                        }),
                    )
                }
                disabled={!name() || !!errors().name}
            >
                Save
            </Button>
        </div>
    );
};

export default NewFavorite;
