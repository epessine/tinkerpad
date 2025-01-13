import { onMount } from 'solid-js';
import tippy from 'tippy.js';

const createTooltip = (selector: string, content: string) => {
    onMount(() => {
        tippy(selector, {
            content,
            theme: 'translucent',
            arrow: true,
            delay: [300, 50],
        });
    });
};

export { createTooltip };
