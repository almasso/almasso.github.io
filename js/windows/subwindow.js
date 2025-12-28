import Window from "./window.js";

export default class Subwindow extends Window {
    constructor(programInstance, windowId, width = 400, height = 300, maxWidth = width * 2, maxHeight = height * 2, data = {}) {
        super(programInstance, windowId, width, height, maxWidth, maxHeight);
        this.name = data.name ? data.name : "Finder";
        this.contentRoute = data.contentRoute;
    }

    changeWindowName(newName) {
        this.name = newName;
        this.win.querySelector(".window-title").innerHTML = `${this.name}`;
    }

    async _createWindow() {
        this.win = document.createElement("div");
        this.win.className = "window";
        this.win.id = `${this.program.instanceID}`;
        this.win.style.visibility = 'hidden';

        const response = await fetch(this.contentRoute);
        const bodyHTML = await response.text();
        this.win.innerHTML = `
            <div class="window-header">
                <img class="close-button" src="assets/icons/system/window/but.png"/>
                <div class="title-stripe left-stripe"></div>
                <div class="window-title">${this.name}</div>
                <div class="title-stripe right-stripe"></div>
                <img class="maxim-button" src="assets/icons/system/window/maximize.png"/>
                <img class="minim-button" src="assets/icons/system/window/minimize.png"/>
            </div>
            <div class="window-body">${bodyHTML}</div>
        `;

        const pageStyle = document.createElement("link");
        pageStyle.rel = "stylesheet";
        pageStyle.href = `css/programs/${this.program.id}.css`;
        this.win.appendChild(pageStyle);
    }

    focus() {
        if(this.win) {
            this.win.style.zIndex = 3;

            this.win.classList.remove("disabled");
            this.win.querySelector(".close-button").classList.remove("disabled");
            this.win.querySelector(".left-stripe").classList.remove("disabled");
            this.win.querySelector(".right-stripe").classList.remove("disabled");
            this.win.querySelector(".maxim-button").classList.remove("disabled");
            this.win.querySelector(".minim-button").classList.remove("disabled");
        }
    }

    close() {
        this.program.closeSubwindow(this);
    }
}