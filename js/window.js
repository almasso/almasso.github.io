export default class Window extends EventTarget{
    constructor(os, program, id, width = 400, height = 300, maxWidth = 800, maxHeight = 600) {
        super();
        this.program = program;
        this.id = id;
        this.os = os;
        this.win = null;
        this.showDetails = false;
        this.width = width;
        this.height = height;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.minimized = false;
    }

    async open() {
        let existingWindow = document.getElementById(`${this.program.id}-${this.id}`);
        if(!existingWindow) {
            this.win = document.createElement("div");
            this.win.className = "window";
            this.win.id = `${this.program.instanceID}`;
            const bodyHTML = await this.program.getBodyHTML();
            this.win.innerHTML = `
                <div class="window-header">
                    <img class="close-button" src="assets/icons/system/but.png"/>
                    <div class="title-stripe left-stripe"></div>
                    <div class="window-title">${this.program.name}</div>
                    <div class="title-stripe right-stripe"></div>
                    <img class="maxim-button" src="assets/icons/system/maximize.png"/>
                    <img class="minim-button" src="assets/icons/system/minimize.png"/>
                </div>
                ${this.showDetails ? `<div class="window-details"></div>` : ``}
                <div class="window-body">${bodyHTML}</div>
            `;

            const pageStyle = document.createElement("link");
            pageStyle.rel = "stylesheet";
            pageStyle.href = `css/programs/${this.program.id}.css`;
            this.win.appendChild(pageStyle);

            const dk = document.getElementById("desktop");

            this.win.querySelector(".close-button").addEventListener("mousedown", () => {
                this.win.querySelector(".close-button").src = "assets/icons/system/butpressed.png"
            });
            this.win.querySelector(".close-button").addEventListener("mouseup", () => {
                this.win.querySelector(".close-button").src = "assets/icons/system/but.png"
            });
            this.win.querySelector(".close-button").addEventListener("click", () => {
                this.close();
            });
            this.win.querySelector(".maxim-button").addEventListener("mousedown", () => {
                this.win.querySelector(".maxim-button").src = "assets/icons/system/maximizepressed.png"
            });
            this.win.querySelector(".maxim-button").addEventListener("mouseup", () => {
                this.win.querySelector(".maxim-button").src = "assets/icons/system/maximize.png"
            });
            this.win.querySelector(".maxim-button").addEventListener("click", () => {
                this.maximize();
            });
            this.win.querySelector(".minim-button").addEventListener("mousedown", () => {
                this.win.querySelector(".minim-button").src = "assets/icons/system/minimizepressed.png"
            });
            this.win.querySelector(".minim-button").addEventListener("mouseup", () => {
                this.win.querySelector(".minim-button").src = "assets/icons/system/minimize.png"
            });
            this.win.querySelector(".minim-button").addEventListener("click", () => {
                this.minimize();
            });

            this.win.querySelector(".window-header").style.width = this.win.style.width = `${this.width}px`;
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
        this.os.dispatchEvent(new CustomEvent("closeWindow", {
            detail: {windowId: this.id, app: this.program}
        }));
        this.win.remove();
        this.win = null;
    }

    minimize() {
        this.win.style.height = this.win.style.height === "15px" ? `${this.height}px` : "15px" ;
        if(this.showDetails) this.win.querySelector(".window-details").classList.toggle("hidden");
        this.win.querySelector(".window-body").classList.toggle("hidden");
        this.minimized = !this.minimized;
    }

    maximize() {
        if(this.minimized) this.minimize();
        this.win.querySelector(".window-header").style.width = this.win.style.width = this.win.style.width === `${this.maxWidth}px` ? `${this.width}px` : `${this.maxWidth}px`;
        this.win.style.height = this.win.style.height === `${this.maxHeight}px` ? `${this.height}px` : `${this.maxHeight}px`;
    }

    focus() {
        this.os.dispatchEvent(new CustomEvent("focusWindow", {
            detail: {windowId: this.id, app: this.program}
        }));
        this.win.style.zIndex = 3;
    }

    unfocus() {
        this.os.dispatchEvent(new CustomEvent("unfocusWindow", {
            detail: {windowId: this.id, app: this.program}
        }));
        this.win.style.zIndex = 2;
    }

    makeDraggable() {
        const header = this.win.querySelector(".window-details");
        const content = this.win.querySelector(".window-body");
        let offsetX = 0, offsetY = 0;

        this.win.addEventListener("mousedown", (e) => {
            if((header != null && header.contains(e.target)) || content.contains(e.target)) return;

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