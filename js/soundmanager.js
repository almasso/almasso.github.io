import { getRoot } from "./utils.js";

export default class SoundManager {
    static #Instance = null;
    #sounds = {};
    #soundsPath = `${getRoot()}assets/sounds/`

    constructor() {}

    static initInstance() {
        if(!SoundManager.#Instance) SoundManager.#Instance = new SoundManager();
        return;
    }

    static getInstance() {
        if(!SoundManager.#Instance) SoundManager.initInstance();
        return SoundManager.#Instance;
    }

    load(src, name = src) {
        const audio = new Audio(this.#soundsPath + src);
        audio.preload = 'auto';
        audio.volume = window.ALMASSO_AUDIO.volume;
        this.#sounds[name] = audio;
    }

    play(name, volume = window.ALMASSO_AUDIO.volume) {
        const sound = this.#sounds[name];
        if(sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.warn(`Error at playing audio ${name}`, e));
        }
    }
}