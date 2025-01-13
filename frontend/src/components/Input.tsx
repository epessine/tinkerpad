import { Component, JSX, Show } from 'solid-js';
import { useGeneralStore } from '../stores/general';

const Input: Component<
    JSX.InputHTMLAttributes<HTMLInputElement> & {
        label?: string;
        error?: string;
        vertical?: boolean;
    }
> = props => {
    const [generalStore] = useGeneralStore();

    return (
        <div class="grow">
            <div
                class="flex items-center justify-between relative"
                classList={{ 'flex-col gap-1 !items-start': props.vertical }}
            >
                <Show when={props.label}>
                    <label class="whitespace-nowrap" classList={{ 'ml-0.5': props.vertical }}>
                        {props.label}
                    </label>
                </Show>
                <input
                    {...props}
                    class={props.class + ' rounded-lg px-2 py-1.5 w-full'}
                    classList={{ 'max-w-[65%]': !props.vertical }}
                    style={{ 'background-color': generalStore.themeInfo.colors.secondary }}
                />
                {props.children}
            </div>
            <Show when={props.error}>
                <span class="text-xs text-right text-red-500">{props.error}</span>
            </Show>
        </div>
    );
};

export default Input;
