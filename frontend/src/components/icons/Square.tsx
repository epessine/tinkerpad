import { Component } from 'solid-js';

const Square: Component<{ class: string }> = props => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            {...props}
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
    );
};

export default Square;
