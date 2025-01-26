import { Component } from 'solid-js';
import { favorites } from '../../../wailsjs/go/models';
import Input from '../Input';
import { useCodeStore } from '../../stores/code';
import Code from './Code';
import { Screen, useGeneralStore } from '../../stores/general';
import Button from '../Button';
import { getSnippetModel } from '../../utils/editor/model';

const View: Component<{ favorite: favorites.Favorite }> = props => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();

    return (
        <div class="py-2 flex flex-col gap-5">
            <Input
                label="Name"
                value={props.favorite.name}
                type="text"
                class="!max-w-[90%]"
                disabled
            />
            <Input
                label="Project"
                value={props.favorite.workingDir}
                type="text"
                disabled
                class="!max-w-[90%]"
            />
            <div
                class="h-96 border"
                style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            >
                <Code favorite={props.favorite} />
            </div>
            <div class="flex gap-2">
                <Button
                    on:click={() => {
                        codeStore.setTabCode(codeStore.currentTabId, props.favorite.code);
                        getSnippetModel(codeStore.currentTab)!.setValue(props.favorite.code);
                        generalStore.setCurrentScreen(Screen.Code);
                    }}
                    class="whitespace-nowrap"
                >
                    Apply on current tab
                </Button>
                <Button
                    on:click={() => {
                        codeStore.createNewTab();
                        codeStore.setTabWorkingDir(
                            codeStore.currentTabId,
                            props.favorite.workingDir,
                        );
                        codeStore.setTabCode(codeStore.currentTabId, props.favorite.code);
                        generalStore.setCurrentScreen(Screen.Code);
                    }}
                    class="whitespace-nowrap"
                >
                    Apply on new tab
                </Button>
            </div>
        </div>
    );
};

export default View;
