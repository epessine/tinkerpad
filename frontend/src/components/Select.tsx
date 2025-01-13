import { Component, JSX, Show } from 'solid-js';
import { useGeneralStore } from '../stores/general';

const Select: Component<
    JSX.SelectHTMLAttributes<HTMLSelectElement> & {
        label: string;
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
                <label class="whitespace-nowrap" classList={{ 'ml-0.5': props.vertical }}>
                    {props.label}
                </label>
                <select
                    {...props}
                    class={props.class + ' rounded-lg px-2 py-1.5 w-full h-7 bg-transparent'}
                    classList={{ 'max-w-[65%]': !props.vertical }}
                >
                    {props.children}
                </select>
            </div>
            <Show when={props.error}>
                <span class="text-xs text-right text-red-500">{props.error}</span>
            </Show>
        </div>
    );
};

export default Select;
