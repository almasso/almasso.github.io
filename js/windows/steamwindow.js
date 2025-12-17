import Window from "./window.js";
import WindowAnimator from "./windowanimator.js";

export default class SteamWindow extends Window {
    constructor(programInstance, windowId, width = 400, height = 300, maxWidth = width * 2, maxHeight = height * 2) {
        super(programInstance, windowId, width, height, maxWidth, maxHeight);
    }

    async _createWindow() {
        this.win = document.createElement("div");
        this.win.className = "steam-window";
        this.win.id = `${this.program.instanceID}`;

        this.win.style.visibility = 'hidden';

        const bodyHTML = await this.program.getBodyHTML();
        this.win.innerHTML = `
            <div class="steam-window-header">
                <div class="steam-window-title-and-logo">
                    <img class="steam-white-logo" src="assets/icons/programs/steam/steam-white.png"/>
                    <div class="steam-window-title">${this.program.name}</div>
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

    _addButtonListeners() {
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
    } 

    focus() {
        if(this.win) {
            this.program.gainedFocus();
        }
    }

    unfocus() {
        if(this.win) {
            this.program.lostFocus();
        }
    }

    minimize() {
        this.win.style.height = this.win.style.height === "15px" ? `${this.height}px` : "15px" ;
        this.win.querySelector(".steam-window-body").classList.toggle("hidden");
        this.minimized = !this.minimized;
    }

    maximize() {
        if(this.minimized) this.minimize();
        this.win.querySelector(".steam-window-header").style.width = this.win.style.width = this.win.style.width === `${this.maxWidth}px` ? `${this.width}px` : `${this.maxWidth}px`;
        this.win.style.height = this.win.style.height === `${this.maxHeight}px` ? `${this.height}px` : `${this.maxHeight}px`;
    }

    makeDraggable() {
        const content = this.win.querySelector(".steam-window-body");
        let offsetX = 0, offsetY = 0;

        this.win.addEventListener("mousedown", (e) => {
            if(content.contains(e.target)) return;

            this.isDragging = true;
            offsetX = e.clientX - this.win.offsetLeft;
            offsetY = e.clientY - this.win.offsetTop;
        });
        
        document.addEventListener("mousemove", (e) => {
            if(this.isDragging) {
                this.win.style.left = (e.clientX - offsetX) + 'px';
                this.win.style.top = (e.clientY - offsetY) + 'px';
            }
        });

        document.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }
}