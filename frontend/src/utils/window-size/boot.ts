import {
    WindowGetPosition,
    WindowGetSize,
    WindowSetPosition,
    WindowSetSize,
} from '../../../wailsjs/runtime/runtime';
import { useGeneralStore } from '../../stores/general';

const [generalStore] = useGeneralStore();

const listener = async () => {
    const size = await WindowGetSize();
    const position = await WindowGetPosition();

    generalStore.setWindowStats({ width: size.w, height: size.h, x: position.x, y: position.y });
};

const boot = () => {
    const windowStats = generalStore.window;

    if (windowStats) {
        WindowSetPosition(windowStats.x, windowStats.y);
        WindowSetSize(windowStats.width, windowStats.height);
    }

    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
};

export { boot, listener };
