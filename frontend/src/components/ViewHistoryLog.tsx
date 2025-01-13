import { Component } from 'solid-js';
import { history } from '../../wailsjs/go/models';
import { useCodeStore } from '../stores/code';
import { Screen, useGeneralStore } from '../stores/general';
import Button from './Button';
import { getSnippetModel } from '../utils/editor/model';
import HistoryLogCode from './HistoryCode';

const ViewHistoryLog: Component<{ log: history.HistoryLog }> = props => {
    const [codeStore] = useCodeStore();
    const [generalStore] = useGeneralStore();

    return (
        <div class="py-2 flex flex-col gap-5">
            <span>
                <span>Code run at </span>
                <span class="font-bold">{new Date(props.log.timestamp).toLocaleString()} </span>
                <span>in project </span>
                <span class="font-bold">{props.log.workingDir}</span>
            </span>
            <div
                class="h-96 border"
                style={{ 'border-color': generalStore.themeInfo.colors.secondary }}
            >
                <HistoryLogCode log={props.log} />
            </div>
            <div class="flex gap-2">
                <Button
                    on:click={() => {
                        codeStore.setTabCode(codeStore.currentTabId, props.log.code);
                        getSnippetModel(codeStore.currentTab)!.setValue(props.log.code);
                        generalStore.setCurrentScreen(Screen.Code);
                    }}
                    class="whitespace-nowrap"
                >
                    Apply on current tab
                </Button>
                <Button
                    on:click={() => {
                        codeStore.createNewTab();
                        codeStore.setTabWorkingDir(codeStore.currentTabId, props.log.workingDir);
                        codeStore.setTabCode(codeStore.currentTabId, props.log.code);
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

export default ViewHistoryLog;
