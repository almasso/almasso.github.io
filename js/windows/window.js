import WindowAnimator from "./windowanimator.js";
import ProcessManager from "../processmanager.js";
import WindowManager from "./windowmanager.js";
import OS from "../os.js";

export default class Window extends EventTarget{
    constructor(programInstance, windowId, width = 400, height = 300, maxWidth = width * 2, maxHeight = height * 2) {
        super();
        this.program = programInstance;
        this.id = windowId;
        this.win = null;
        this.width = width;
        this.height = height;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.minimized = false;
    }

    /**
     * Creates the HTML window element, assigns the program-defined body and assigns the styles
     */
    async _createWindow() {
        this.win = document.createElement("div");
        this.win.className = "window";
        this.win.id = `${this.program.instanceID}`;

        this.win.style.visibility = 'hidden';

        const bodyHTML = await this.program.getBodyHTML();
        this.win.innerHTML = `
            <div class="window-header">
                <img class="close-button" src="assets/icons/system/window/but.png"/>
                <div class="title-stripe left-stripe"></div>
                <div class="window-title">${this.program.name}</div>
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

    /**
     * Adds listeners and functionality to all window buttons
     */
    _addButtonListeners() {
        this.win.querySelector(".close-button").addEventListener("mousedown", () => {
            this.win.querySelector(".close-button").src = "assets/icons/system/window/butpressed.png"
        });
        this.win.querySelector(".close-button").addEventListener("mouseup", () => {
            this.win.querySelector(".close-button").src = "assets/icons/system/window/but.png"
        });
        this.win.querySelector(".close-button").addEventListener("click", () => {
            this.close();
        });
        this.win.querySelector(".maxim-button").addEventListener("mousedown", () => {
            this.win.querySelector(".maxim-button").src = "assets/icons/system/window/maximizepressed.png"
        });
        this.win.querySelector(".maxim-button").addEventListener("mouseup", () => {
            this.win.querySelector(".maxim-button").src = "assets/icons/system/window/maximize.png"
        });
        this.win.querySelector(".maxim-button").addEventListener("click", () => {
            this.maximize();
        });
        this.win.querySelector(".minim-button").addEventListener("mousedown", () => {
            this.win.querySelector(".minim-button").src = "assets/icons/system/window/minimizepressed.png"
        });
        this.win.querySelector(".minim-button").addEventListener("mouseup", () => {
            this.win.querySelector(".minim-button").src = "assets/icons/system/window/minimize.png"
        });
        this.win.querySelector(".minim-button").addEventListener("click", () => {
            this.minimize();
        });

        this.win.querySelector(".window-header").style.width = this.win.style.width = `${this.width}px`;
        this.win.style.height = `${this.height}px`;
    }

    /**
     * Appends the created window to the desktop (index environment)
     */
    #appendWindowToDesktop() {
        const dk = document.getElementById("desktop");
        const container = document.createElement("div");
        container.id = `windows-container-${this.program.id}-${this.id}`;
        container.appendChild(this.win);
        this.makeDraggable()
        dk.appendChild(container);
    }

    /**
     * Animates the window opening
     */
    #animateWindowOpening() {
        const launcherId = this.program.instanceData.launcherId;
        let iconEl = null;
        if(launcherId) iconEl = document.querySelector(`.desktop-icon[data-launcher-id="${launcherId}"]`);
        if(!iconEl) iconEl = document.querySelector(`.desktop-icon[data-app="${this.program.id}-${this.program.instanceData.desktopName}"]`);

        const onWindowReady = () => {
            WindowManager.getInstance().focus(this);
            this.dispatchEvent(new CustomEvent("window:ready", { 
                detail: { win: this.win } 
            }));
        };

        if(iconEl && document.body.contains(iconEl)) WindowAnimator.animateOpen(iconEl, this.win, () => onWindowReady());
        else {
            this.win.style.visibility = 'visible';
            onWindowReady();
        }
    }

    /**
     * Opens a new window or retrieves an already opened one
     */
    async open() {
        let existingWindow = document.getElementById(`${this.program.id}-${this.id}`);
        if(!existingWindow) {
            await this._createWindow();
            this._addButtonListeners();
            this.#appendWindowToDesktop();
            this.#animateWindowOpening();
        }
        else {
            existingWindow.style.display = "flex";
            WindowManager.getInstance().focus(this);
            this.dispatchEvent(new CustomEvent("window:ready", { detail: { win: existingWindow } }));
        }
        this.win.addEventListener("mousedown", () => {
            WindowManager.getInstance().focus(this);
        });
    }

    close() {
        ProcessManager.getInstance().killProcess(this.program.pid);
    }

    changeWindowName(newName) {
        this.win.querySelector(".window-title").innerHTML = `${newName}`;
    }

    destroy() {
        const performClose = () => {
            if (this.win) {
                const container = this.win.parentElement; 
                this.win.remove();
                if (container && container.id.startsWith("windows-container")) {
                    container.remove();
                }
                this.win = null;
            }
        };

        const launcherId = this.program.instanceData.launcherId;
        let iconEl = null;
        if(launcherId) iconEl = document.querySelector(`.desktop-icon[data-launcher-id="${launcherId}"]`);
        if(!iconEl) iconEl = document.querySelector(`.desktop-icon[data-app="${this.program.id}-${this.program.instanceData.desktopName}"]`);

        if (this.win && iconEl && !this.minimized) {
            WindowAnimator.animateClose(iconEl, this.win, () => {
                performClose();
            });
        } else {
            performClose();
        }
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
        if(this.win) {
            this.win.style.zIndex = 3;

            this.win.classList.remove("disabled");
            this.win.querySelector(".close-button").classList.remove("disabled");
            this.win.querySelector(".left-stripe").classList.remove("disabled");
            this.win.querySelector(".right-stripe").classList.remove("disabled");
            this.win.querySelector(".maxim-button").classList.remove("disabled");
            this.win.querySelector(".minim-button").classList.remove("disabled");
            
            this.program.gainedFocus();
        }
    }

    unfocus() {
        if(this.win) {
            this.win.style.zIndex = 2;

            this.win.classList.add("disabled");
            this.win.querySelector(".close-button").classList.add("disabled");
            this.win.querySelector(".left-stripe").classList.add("disabled");
            this.win.querySelector(".right-stripe").classList.add("disabled");
            this.win.querySelector(".maxim-button").classList.add("disabled");
            this.win.querySelector(".minim-button").classList.add("disabled");

            this.program.lostFocus();
        }
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