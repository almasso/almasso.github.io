import {getRoot} from "./utils.js"
import {Filesystem} from "./filesystem.js";
import { ClassMap } from "./registry.js";
import ProcessManager from "./processmanager.js";

export default class Icon extends EventTarget {

    static iconList = new Array();

    constructor(fileData, containerId) {
        super();
        if(!fileData.programId && (fileData.type === "folder" || fileData.type === "link")) {
            fileData.programId = "finder";
        }
        const registryData = Filesystem.registry[fileData.programId] || {};
        this.fileData = {...registryData, ...fileData};
        this.containerId = containerId;
        this.uuid = `${this.containerId}_${this.fileData.programId}_${this.fileData.desktopName || this.fileData.name}`;
        this.isAlias = this.fileData.metadata ? this.fileData.metadata.isAlias : false;
        this.name = this.fileData.desktopName || registryData.name || this.fileData.name;
        this.iconPath = this.fileData.desktopIcon || registryData.icon || this.fileData.icon;

        this.iconDiv = null;
        this.selected = false;
        this.opened = false;

        Icon.iconList.push(this);

        this.#createProgramIcon();
    }

    static #garbageCollect() {
        Icon.iconList = Icon.iconList.filter(ic => ic.iconDiv && document.body.contains(ic.iconDiv));
    }

    /**
     * Unclicks (deapplies the click effect) to all icons but the exception one
     * @param {Icon} iconException Icon execption to unclick
     */
    static #unclickIcons(iconException = null, containerId = null) {
        Icon.#garbageCollect();
        Icon.iconList.forEach(ic => {
            if(containerId && ic.containerId !== containerId) return;
            if(ic !== iconException) {
                ic.selected = false;
                ic.iconDiv.querySelector(".icon-div").classList.remove("selected");
                ic.iconDiv.querySelector("#prog-name").classList.remove("selected-name");
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
     */
    static onProcessClosed(processData) {
        Icon.#garbageCollect();
        const launcherId = processData.launcherId;
        if(!launcherId) return;

        const remainingProcesses = ProcessManager.getInstance().countProcessesByLauncher(launcherId);
        if(remainingProcesses === 0) {
            const targetIcon = Icon.iconList.find(ic => ic.uuid === launcherId);
            if(targetIcon) {
                Icon.#unclickIcons(null);
                targetIcon.iconDiv.querySelector(".icon-div").classList.remove("opened-app");
                targetIcon.opened = false;
            }
        }  
    }

    /**
     * Selects (applies the click effect) an icon given the process data corresponding to that icon and its route, while unselecting the rest
     * @param {Object} processData Object with process data (primarily process program identifier or name and file name)
     */
    static selectIcon(processData) {
        Icon.#garbageCollect();

        if(processData.launcherId) {
            const targetIcon = Icon.iconList.find(ic => ic.uuid === processData.launcherId);
            if(targetIcon) {
                Icon.#unclickIcons(targetIcon, targetIcon.containerId);
                targetIcon.#selectIcon();
                targetIcon.selected = false;
            }
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
        this.iconDiv.dataset.app = `${this.fileData.programId}-${this.name}`;
        this.iconDiv.dataset.launcherId = this.uuid;
        this.iconDiv.setAttribute("is-alias", this.isAlias);

        const imgDiv = document.createElement("div");
        imgDiv.className = "icon-div";

        let basePath = `${getRoot()}assets/icons/`;
        if(this.fileData.type === "folder" || this.fileData.type === "systemfile" || this.fileData.type === "link" ||
            this.name === "Macintosh HD") basePath += "system/";
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

        this.iconDiv.addEventListener("click", async (e) => {
            e.stopPropagation();

            if(!this.selected) {
                Icon.#selectIconPriv(this);
            }
            else {
                this.iconDiv.querySelector(".icon-div").classList.add("opened-app");
                this.iconDiv.querySelector(".icon-div").style.setProperty("--icon-url", `url(${iconSrc})`);
                this.isAlias ? this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "34%") : this.iconDiv.querySelector(".icon-div").style.setProperty("--dots-displacement", "25%");
                this.opened = true;

                Icon.#unclickIcons(null);
                const AppClass = ClassMap[this.fileData.classRef];
                if(AppClass) {
                    const launchMetadata = {...this.fileData, launcherId: this.uuid};
                    await AppClass.launch(launchMetadata);
                }
            }
        });
        
        const dk = document.getElementById(this.containerId);
        dk.appendChild(this.iconDiv);
    }
    
}