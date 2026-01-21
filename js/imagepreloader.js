import { getRoot } from "./utils.js";

export default class ImagePreloader {
    static #Instance = null;
    #imgRoute = `${getRoot()}assets/icons/`

    constructor() {
        this.#preloadImages();
    }

    static initInstance() {
        if(!ImagePreloader.#Instance) ImagePreloader.#Instance = new ImagePreloader();
        return;
    }

    static getInstance() {
        if(!ImagePreloader.#Instance) ImagePreloader.initInstance();
        return ImagePreloader.#Instance;
    }

    #preloadImages() {
        fetch(this.#imgRoute + "assets.json")
            .then(response => response.json())
            .then(routes => {
                routes.forEach(url => {
                    const img = new Image();
                    img.src = this.#imgRoute + url;
                });
            })
    }
}