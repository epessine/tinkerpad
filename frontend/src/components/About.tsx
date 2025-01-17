import { Component, createResource } from 'solid-js';
import { GetAppVersion } from '../../wailsjs/go/settings/Settings';
import logo from '../assets/appicon.png';

const About: Component = () => {
    const [appVersion] = createResource(async () => await GetAppVersion());

    return (
        <div class="py-5 flex flex-col w-full h-full items-center gap-2">
            <img class="w-32" src={logo} alt="tinkerpad" />
            <span class="font-bold">Tinkerpad</span>
            <span class="text-xs">Current Version: {appVersion()}</span>
        </div>
    );
};

export default About;
