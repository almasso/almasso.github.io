import {getRoot} from "./utils.js"

export default class Icon extends EventTarget {
    constructor(os, program, isAlias, route) {
        super();
        this.os = os;
        this.program = program;
        this.isAlias = isAlias;
        this.route = route;
        this.iconDiv = null;

        this.selected = false;

        this.#createProgramIcon();
    }

    /**
     * Creates an icon on the specified route of the OS
     */
    #createProgramIcon() {
        const dk = document.getElementById(this.route);

        this.iconDiv = document.createElement("div");
        this.iconDiv.className = "desktop-icon";
        this.iconDiv.dataset.app = this.program.id;
        this.iconDiv.setAttribute("is-alias", this.isAlias);

        const imgDiv = document.createElement("div");
        imgDiv.className = "icon-div";

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

            imgDiv.appendChild(iconStack);
        } 
        else {
            const img = document.createElement("img");
            img.className = "indiv-icon";
            img.src = `${getRoot()}assets/icons/programs/${this.program.icon}`;
            imgDiv.appendChild(img);
        }

        this.iconDiv.appendChild(imgDiv);

        const label = document.createElement("div");
        label.id = "prog-name";
        label.innerHTML = this.isAlias ? `<i>${this.program.name}</i>` : this.program.name;
        this.iconDiv.appendChild(label);

        this.iconDiv.addEventListener("click", () => {
            if(!this.selected) {
                this.os.dispatchEvent(new CustomEvent("iconSelected", {
                    detail : {program : this.program}
                }));
                this.iconDiv.querySelector(".icon-div").classList.add("selected");
                this.iconDiv.querySelector("#prog-name").classList.add("selected-name");
                this.selected = true;
            }
            else {
                this.os.openWindow(this.program);
                 this.iconDiv.querySelector(".icon-div").classList.remove("selected");
                this.iconDiv.querySelector(".icon-div").classList.add("opened-app");
                this.iconDiv.querySelector(".icon-div").style.setProperty("--icon-url", `url(${getRoot()}assets/icons/programs/${this.program.icon})`);
                this.isAlias ? this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "34%") : this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "25%");
            }
        });

        this.addEventListener("unclicked", () => {
            this.selected = false;
            this.iconDiv.querySelector(".icon-div").classList.remove("selected");
            this.iconDiv.querySelector("#prog-name").classList.remove("selected-name");
        })

        dk.appendChild(this.iconDiv);
    }
    
}