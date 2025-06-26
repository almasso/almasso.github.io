export default class Program extends EventTarget {
    constructor(os, name, id, icon, isAlias, route) {
        super();
        this.os = os;
        this.name = name;
        this.id = id;
        this.icon = icon;
        this.isDragging = false;
        this.zIndexCounter = 2;
        this.isAlias = isAlias;
        this.route = route;

        this.#createProgramIcon();
    }

    /**
     * Creates an icon on the desktop of the OS
     */
    #createProgramIcon() {
        const dk = document.getElementById("desktop");

        const iconDiv = document.createElement("div");
        iconDiv.className = "desktop-icon";
        iconDiv.dataset.app = this.id;
        iconDiv.setAttribute("is-alias", this.isAlias);

        if(this.isAlias) {
            const iconStack = document.createElement("div");
            iconStack.className = "icon-stack";

            const img = document.createElement("img");
            img.className = "icon";
            img.src = `/assets/icons/programs/${this.icon}`;
            iconStack.appendChild(img);

            const arrow = document.createElement("img");
            arrow.className = "alias-arrow";
            arrow.src = "/assets/icons/system/aliasarrow.png";
            iconStack.appendChild(arrow);

            iconDiv.appendChild(iconStack);
        } 
        else {
            const img = document.createElement("img");
            img.className = "indiv-icon";
            img.src = `/assets/icons/programs/${this.icon}`;
            iconDiv.appendChild(img);
        }

        const label = document.createElement("div");
        label.id = "prog-name";
        label.innerHTML = this.isAlias ? `<i>${this.name}</i>` : this.name;
        iconDiv.appendChild(label);

        iconDiv.addEventListener("click", () => {
            this.openWindow();
        });

        dk.appendChild(iconDiv);
    }

    openWindow() {
        this.os.openWindow(this);
    }

    getButtons() {}

    setLanguage(langcode, callback) {
        console.log("AAAA");
        console.log(langcode, callback)
        fetch(`/assets/texts/${langcode}.json`).then(response => {
            if(!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        }).then(data => {
            this.langData = data;
            if(callback) callback();
            this.os.dispatchEvent(new CustomEvent("langLoaded", {}));
        }).catch(error => {
            console.error("Failed to load JSON: ", error);
        });
    }

    searchForProgramInData() {
        return this.langData?.find(e => e.id === this.id) || null;
    }

    getBodyHTML() {}
}