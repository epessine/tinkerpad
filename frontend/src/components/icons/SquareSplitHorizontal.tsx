import { Component } from 'solid-js';

const SquareSplitHorizontal: Component<{ class: string }> = props => {
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
            <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
            <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
            <line x1="12" x2="12" y1="4" y2="20" />
        </svg>
    );
};

export default SquareSplitHorizontal;
