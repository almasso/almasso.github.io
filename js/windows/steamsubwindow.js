import SteamWindow from "./steamwindow.js";

export default class SteamSubwindow extends SteamWindow {
    constructor(programInstance, windowId, width = 400, height = 300, maxWidth = width * 2, maxHeight = height * 2, data = {}) {
        super(programInstance, windowId, width, height, maxWidth, maxHeight = height);
        this.name = data.name ? data.name : "Steam";
        this.contentRoute = data.contentRoute;
    }

    changeWindowName(newName) {
        this.name = newName;
        this.win.querySelector(".steam-window-title").innerHTML = `${this.name}`;
    }

    async _createWindow() {
        this.win = document.createElement("div");
        this.win.className = "steam-window";
        this.win.id = `${this.program.instanceID}`;
        this.win.style.visibility = 'hidden';
        
        const response = await fetch(this.contentRoute);
        const bodyHTML = await response.text();
        this.win.innerHTML = `
            <div class="steam-window-header">
                <div class="steam-window-title-and-logo">
                    <img class="steam-white-logo" src="assets/icons/programs/steam/steam-white.png"/>
                    <div class="steam-window-title">${this.name}</div>
                </div>
                <div id="steam-window-buttons">
                    <img class="steam-minim-button" src="assets/icons/programs/steam/minimize.png"/>
                    <img class="steam-close-button" src="assets/icons/programs/steam/close.png"/>
                </div>
            </div>
            <div class="steam-window-body">${bodyHTML}</div>
        `;

        const pageStyle = document.createElement("link");
        pageStyle.rel = "stylesheet";
        pageStyle.href = `css/programs/${this.program.id}.css`;
        this.win.appendChild(pageStyle);
    }

    close() {
        this.program.closeSubwindow(this);
    }
}