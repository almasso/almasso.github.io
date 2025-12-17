import {getRoot} from "./utils.js"
import {Filesystem} from "./filesystem.js";
import { ClassMap } from "./registry.js";
import ProcessManager from "./processmanager.js";

export default class Icon extends EventTarget {

    static iconList = new Array();

    constructor(fileData, route) {
        super();
        const registryData = Filesystem.registry[fileData.programId];
        this.fileData = {...registryData, ...fileData, route: route};
        this.isAlias = this.fileData.metadata ? this.fileData.metadata.isAlias : false;
        this.route = route;
        this.name = this.fileData.desktopName;
        this.iconPath = this.fileData.desktopIcon;
        this.iconDiv = null;
        this.selected = false;
        this.opened = false;

        Icon.iconList.push(this);

        this.#createProgramIcon();
    }

    /**
     * Unclicks (deapplies the click effect) to all icons but the exception one
     * @param {Icon} iconException Icon execption to unclick
     */
    static #unclickIcons(iconException = null) {
        Icon.iconList.forEach(ic => {
            if(ic !== iconException) {
                ic.selected = false;
                ic.iconDiv.querySelector(".icon-div").classList.remove("selected");
                ic.iconDiv.querySelector("#prog-name").classList.remove("selected-name");
                ic.selected = false;
            }
        });
    }

    /**
     * Selects (applies the click effect) an icon
     */
    #selectIcon() {
        this.iconDiv.querySelector(".icon-div").classList.add("selected");
        this.iconDiv.querySelector("#prog-name").classList.add("selected-name");
        this.selected = true;
    }

    /**
     * Logic to apply to icons when a process is closed
     * @param {Object} processData Object with process data (primarily process program identifier or name and file name)
     * @param {String} route Icon route
     */
    static onProcessClosed(processData, route) {
        let moreProcesses = ProcessManager.getInstance().findProcessByProgramId(processData.programId);
        if(moreProcesses.length === 0) {
            let foundIcon = Icon.iconList.find(ic => (ic.fileData.desktopName === processData.desktopName) && 
            (ic.fileData.programId === processData.programId) && (ic.route === route));
            if(foundIcon) {
                Icon.#unclickIcons(null);
                foundIcon.iconDiv.querySelector(".icon-div").classList.remove("opened-app");
                foundIcon.opened = false;
            }
        }  
    }

    /**
     * Selects (applies the click effect) an icon given the process data corresponding to that icon and its route, while unselecting the rest
     * @param {Object} processData Object with process data (primarily process program identifier or name and file name)
     * @param {String} route Icon route
     */
    static selectIcon(processData, route) {
        let foundIcon = Icon.iconList.find(ic => (ic.fileData.desktopName === processData.desktopName) && 
            (ic.fileData.programId === processData.programId) && (ic.route === route));
        if(foundIcon) {
            Icon.#unclickIcons(foundIcon);
            foundIcon.#selectIcon();
            foundIcon.selected = false;
        }
    }

    /**
     * Same as above, but internally and using an icon instance
     * @param {Icon} icon 
     */
    static #selectIconPriv(icon) {
        Icon.#unclickIcons(icon);
        icon.#selectIcon();
    }

    /**
     * Unclicks (deapplies the click effect) to all icons
     */
    static unclickAllIcons() {
        Icon.#unclickIcons(null);
    }

    /**
     * Creates an icon on the specified route of the OS
     */
    #createProgramIcon() {
        this.iconDiv = document.createElement("div");
        this.iconDiv.className = "desktop-icon";
        this.iconDiv.dataset.app = `${this.fileData.programId}-${this.fileData.desktopName}`;
        this.iconDiv.setAttribute("is-alias", this.isAlias);

        const imgDiv = document.createElement("div");
        imgDiv.className = "icon-div";

        let basePath = `${getRoot()}assets/icons/`;
        if(this.fileData.type === "folder" || this.fileData.type === "systemfile" || this.name === "Macintosh HD") basePath += "system/";
        else basePath += "programs/";

        const iconSrc = `${basePath}${this.iconPath}`;

        if(this.isAlias) {
            const iconStack = document.createElement("div");
            iconStack.className = "icon-stack";

            const img = document.createElement("img");
            img.className = "icon";
            img.src = `${iconSrc}`;
            iconStack.appendChild(img);

            const arrow = document.createElement("img");
            arrow.className = "alias-arrow";
            arrow.src = `${getRoot()}assets/icons/system/aliasarrow.png`;
            iconStack.appendChild(arrow);

            imgDiv.appendChild(iconStack);
        } 
        else {
            const img = document.createElement("img");
            img.className = "indiv-icon";
            img.src = `${iconSrc}`;
            imgDiv.appendChild(img);
        }

        this.iconDiv.appendChild(imgDiv);

        const label = document.createElement("div");
        label.id = "prog-name";
        label.innerHTML = this.isAlias ? `<i>${this.name}</i>` : this.name;
        this.iconDiv.appendChild(label);

        this.iconDiv.addEventListener("click", async () => {
            if(!this.selected) {
                Icon.#selectIconPriv(this);
            }
            else {
                this.iconDiv.querySelector(".icon-div").classList.add("opened-app");
                this.iconDiv.querySelector(".icon-div").style.setProperty("--icon-url", `url(${iconSrc})`);
                this.isAlias ? this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "34%") : this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "25%");
                this.opened = true;

                Icon.#unclickIcons(null);
                const AppClass = ClassMap[Filesystem.registry[(this.fileData.programId)].classRef];
                if(AppClass) {
                    await AppClass.launch(this.fileData);
                }
            }
        });
        
        const dk = document.getElementById(this.route.split("/").slice(-1)[0].toLowerCase());
        dk.appendChild(this.iconDiv);
    }
    
}