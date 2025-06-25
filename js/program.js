export default class Program {
    constructor(name, id, icon, isAlias, route) {
        this.name = name;
        this.id = id;
        this.icon = icon;
        this.win = null;
        this.isDragging = false;
        this.zIndexCounter = 2;
        this.isAlias = isAlias;
        this.route = route;

        this.#createProgramIcon();
    }

    #createProgramIcon() {
        const dk = document.getElementById("desktop");
        dk.innerHTML += `
            <div class="desktop-icon" data-app=${this.id} is-alias=${this.isAlias}>
                ${this.isAlias ? `<div class="icon-stack">` : ``}
                    <img class=${this.isAlias ? "icon" : "indiv-icon"} src="/assets/icons/programs/${this.icon}" />
                    ${this.isAlias ? `<img class="alias-arrow" src="/assets/icons/system/aliasarrow.png" />` : ``}
                ${this.isAlias ? `</div>` : ``}
                <div id="prog-name">${this.isAlias ? `<i>${this.name}</i>` : this.name}</div>
            </div>
        `;

        const icon = document.querySelector(`.desktop-icon[data-app=${this.id}]`);
        icon.addEventListener("click", () => {
            this.openWindow();
        });
    }

    openWindow() {
        let existingWindow = document.getElementById(this.id);
        if(!existingWindow) {
            this.win = document.createElement("div");
            this.win.className = "window";
            this.win.id = this.id;
            this.win.innerHTML = `
                <div class="window-header">${this.name}</div>
                <div class="window-body">${this.getBodyHTML()}</div>
            `;

            const dk = document.getElementById("desktop");
            dk.innerHTML += `
                <div id="windows-container-${this.id}"></div>
            `;
            let wC = document.getElementById(`windows-container-${this.id}`);
            wC.appendChild(this.win);
            this.makeDraggable()
            this.focusWindow();
        }
        else {
            existingWindow.style.display = "flex";
            this.focusWindow();
        }
    }

    focusWindow() {
        this.win.style.zIndex = this.zIndexCounter++;
    }

    makeDraggable() {
        const header = this.win.querySelector(".window-header");
        let offsetX = 0, offsetY = 0;

        header.addEventListener("mousedown", (e) => {
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

    getBodyHTML() {}
}