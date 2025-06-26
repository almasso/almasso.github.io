export default class Window extends EventTarget{
    constructor(os, program, id) {
        super();
        this.program = program;
        this.id = id;
        this.os = os;
        this.win = null;
    }

    open() {
        let existingWindow = document.getElementById(`${this.program.id}-${this.id}`);
        if(!existingWindow) {
            this.win = document.createElement("div");
            this.win.className = "window";
            this.win.id = `${this.program.id}-${this.id}`;
            this.win.innerHTML = `
                <div class="window-header">${this.program.name}</div>
                <div class="window-body">${this.program.getBodyHTML()}</div>
            `;

            const dk = document.getElementById("desktop");
            
            const container = document.createElement("div");
            container.id = `windows-container-${this.program.id}-${this.id}`;
            container.appendChild(this.win);
            this.makeDraggable()
            this.focus();
            dk.appendChild(container);
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

    }

    minimize() {

    }

    maximize() {

    }

    focus() {
        this.os.dispatchEvent(new CustomEvent("focusWindow", {
            detail: {windowId: this.id, app: this.program}
        }));
        this.win.style.zIndex = 3;
    }

    unfocus() {
        this.win.style.zIndex = 2;
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
}