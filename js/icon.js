export default class Icon {
    constructor(os, program, isAlias, route) {
        this.os = os;
        this.program = program;
        this.isAlias = isAlias;
        this.route = route;

        this.#createProgramIcon();
    }

    /**
     * Creates an icon on the specified route of the OS
     */
    #createProgramIcon() {
        const dk = document.getElementById(this.route);

        const iconDiv = document.createElement("div");
        iconDiv.className = "desktop-icon";
        iconDiv.dataset.app = this.program.id;
        iconDiv.setAttribute("is-alias", this.isAlias);

        if(this.isAlias) {
            const iconStack = document.createElement("div");
            iconStack.className = "icon-stack";

            const img = document.createElement("img");
            img.className = "icon";
            img.src = `assets/icons/programs/${this.program.icon}`;
            iconStack.appendChild(img);

            const arrow = document.createElement("img");
            arrow.className = "alias-arrow";
            arrow.src = "assets/icons/system/aliasarrow.png";
            iconStack.appendChild(arrow);

            iconDiv.appendChild(iconStack);
        } 
        else {
            const img = document.createElement("img");
            img.className = "indiv-icon";
            img.src = `assets/icons/programs/${this.program.icon}`;
            iconDiv.appendChild(img);
        }

        const label = document.createElement("div");
        label.id = "prog-name";
        label.innerHTML = this.isAlias ? `<i>${this.program.name}</i>` : this.program.name;
        iconDiv.appendChild(label);

        iconDiv.addEventListener("click", () => {
            this.os.openWindow(this.program);
        });

        dk.appendChild(iconDiv);
    }
    
}