import Subwindow from "./subwindow.js";

export default class AlertSW extends Subwindow {
    constructor(programInstance, windowId, width = 400, height = 300, maxWidth = width * 2, maxHeight = height * 2, data = {}) {
        super(programInstance, windowId, width, height, maxWidth, maxHeight);
        this.name = data.name ? data.name : "Finder";
        this.contentRoute = data.contentRoute;
    }

    async _createWindow() {
        this.win = document.createElement("div");
        this.win.className = "window";
        this.win.id = `${this.program.instanceID}`;
        this.win.style.visibility = 'hidden';

        const response = await fetch(this.contentRoute);
        const bodyHTML = await response.text();
        this.win.innerHTML = `
            <div class="alert-body">${bodyHTML}</div>
        `;

        const pageStyle = document.createElement("link");
        pageStyle.rel = "stylesheet";
        pageStyle.href = `css/system/alert.css`;
        this.win.appendChild(pageStyle);
    }

    _addButtonListeners() {
        this.win.style.width = `${this.width}px`;
        this.win.style.height = `${this.height}px`;
        const rect = this.win.getBoundingClientRect();
        const crect = document.getElementById("monitor").getBoundingClientRect();
        this.win.style.position = "fixed";
        this.win.style.top = "20%";
        this.win.style.left = "50%";
        this.win.style.transform = "translate(-50%, 0%)";
    }

    focus() {
        if(this.win) {
            this.win.style.zIndex = 3;
        }
    }

    unfocus() {
        if(this.win) {
            this.win.style.zIndex = 2;
        }
    }

    makeDraggable() {}

    close() {
        this.program.closeSubwindow(this);
    }
}