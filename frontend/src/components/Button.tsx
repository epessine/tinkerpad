import { Component, JSX } from 'solid-js';
import { useGeneralStore } from '../stores/general';

const Button: Component<
    JSX.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }
> = props => {
    const [generalStore] = useGeneralStore();

    return (
        <button
            {...props}
            class={
                props.class +
                ' rounded-md w-min px-4 py-1.5 border cursor-default hover:brightness-105 disabled:opacity-50 disabled:border-0 disabled:hover:brightness-100'
            }
            style={{
                'background-color': generalStore.themeInfo.colors.background,
                'border-color': generalStore.themeInfo.colors.secondary,
            }}
        >
            {props.children}
        </button>
    );
};

export default Button;
