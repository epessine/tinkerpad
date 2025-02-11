import { ThemeInfo } from '../../stores/general';
import { Theme } from '../editor/themes';

const getThemeInfo = async (theme: Theme): Promise<ThemeInfo> => {
    const themeData = await import(`../../assets/themes/${theme}.json`);

    return {
        name: theme,
        colors: {
            background: themeData.colors['editor.background'],
            primary: themeData.colors['editor.foreground'],
            secondary: themeData.colors['editor.lineHighlightBackground'],
            editor: {
                string:
                    '#' +
                    themeData.rules.find((rule: any) => rule.token.includes('string'))?.foreground,
                keyword:
                    '#' +
                    themeData.rules.find((rule: any) => rule.token.includes('keyword'))?.foreground,
                variable:
                    '#' +
                    themeData.rules.find((rule: any) => rule.token.includes('variable'))
                        ?.foreground,
            },
        },
    };
};

export default getThemeInfo;
