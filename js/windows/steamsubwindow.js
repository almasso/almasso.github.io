import SteamWindow from "./steamwindow.js";

export default class SteamSubwindow extends SteamWindow {
    constructor(os, program, id, name, contentRoute, width = 400, height = 300, maxWidth = 800, maxHeight = 600) {
        super(os, program, id, width, height, maxWidth, maxHeight);
        this.name = name;
        this.contentRoute = contentRoute;
    }

    async open() {
        let existingWindow = document.getElementById(`${this.program.id}-${this.id}`);
        if(!existingWindow) {
            this.win = document.createElement("div");
            this.win.className = "steam-window";
            this.win.id = `${this.program.instanceID}`;
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

            const dk = document.getElementById("desktop");

            this.win.querySelector(".steam-close-button").addEventListener("mousedown", () => {
                this.win.querySelector(".steam-close-button").src = "assets/icons/programs/steam/close.png"
            });
            this.win.querySelector(".steam-close-button").addEventListener("mouseup", () => {
                this.win.querySelector(".steam-close-button").src = "assets/icons/programs/steam/close.png"
            });
            this.win.querySelector(".steam-close-button").addEventListener("click", () => {
                this.close();
            });
            this.win.querySelector(".steam-minim-button").addEventListener("mousedown", () => {
                this.win.querySelector(".steam-minim-button").src = "assets/icons/programs/steam/minimize.png"
            });
            this.win.querySelector(".steam-minim-button").addEventListener("mouseup", () => {
                this.win.querySelector(".steam-minim-button").src = "assets/icons/programs/steam/minimize.png"
            });
            this.win.querySelector(".steam-minim-button").addEventListener("click", () => {
                this.minimize();
            });

            this.win.querySelector(".steam-window-header").style.width = this.win.style.width = `${this.width}px`;
            this.win.style.height = `${this.height}px`;
            
            const container = document.createElement("div");
            container.id = `windows-container-${this.program.id}-${this.id}`;
            container.appendChild(this.win);
            this.makeDraggable()
            dk.appendChild(container);
            this.focus();
        }
        else {
            existingWindow.style.display = "flex";
            this.focus();
        }
        this.win.addEventListener("mousedown", () => {
            this.focus();
        });
    }

    close() {
        this.os.dispatchEvent(new CustomEvent("closeSubwindow", {
            detail: {windowId: this.id}
        }));
        this.program.dispatchEvent(new CustomEvent("closeSubwindow", {
            detail: {windowName: this.name}
        }));
        this.win.remove();
        this.win = null;
    }
}