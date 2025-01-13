import * as monaco from 'monaco-editor';

import Nord from '../../assets/themes/Nord.json';
import Monokai from '../../assets/themes/Monokai.json';
import GithubDark from '../../assets/themes/GithubDark.json';
import Dracula from '../../assets/themes/Dracula.json';
import Eiffel from '../../assets/themes/Eiffel.json';
import Sunburst from '../../assets/themes/Sunburst.json';
import Dawn from '../../assets/themes/Dawn.json';
import Twilight from '../../assets/themes/Twilight.json';

export enum Theme {
    Nord = 'Nord',
    Monokai = 'Monokai',
    GithubDark = 'GithubDark',
    Dracula = 'Dracula',
    Eiffel = 'Eiffel',
    Sunburst = 'Sunburst',
    Dawn = 'Dawn',
    Twilight = 'Twilight',
}

export const defineThemes = () => {
    monaco.editor.defineTheme(Theme.Nord, Nord as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Monokai, Monokai as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.GithubDark, GithubDark as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Dracula, Dracula as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Eiffel, Eiffel as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Sunburst, Sunburst as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Dawn, Dawn as monaco.editor.IStandaloneThemeData);
    monaco.editor.defineTheme(Theme.Twilight, Twilight as monaco.editor.IStandaloneThemeData);
};
