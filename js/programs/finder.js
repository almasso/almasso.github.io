import { Filesystem, getFolderContent } from "../filesystem.js";
import Program from "../program.js";
import {getRoot, formatString} from "../utils.js";
import Icon from "../icon.js";
import LocalizationManager from "../localizationmanager.js";
import WindowManager from "../windows/windowmanager.js";
import Subwindow from "../windows/subwindow.js";

export default class Finder extends Program {
    static #thisComputer = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);
        if(!this.instanceData.route || this.instanceData.route.includes("undefined")) {
            this.instanceData.route = "/Macintosh HD";
            this.instanceData.desktopName = "Macintosh HD";
        }
        this.#setId();
        this.rendered = false;

        this.functionMap = {
            showAbout : () => this.#showAboutInfo()
        };
    }

    async #showAboutInfo() {
        if(!Finder.#thisComputer) {
            Finder.#thisComputer = WindowManager.getInstance().createWindow(Subwindow, this, 600, 400, 600, 400, 
                {name: LocalizationManager.getInstance().getStringsFromId("os").buttons.apple.options[0].text, contentRoute: `${getRoot()}html/system/about.html`});
            Finder.#thisComputer = await Finder.#thisComputer;
            this.changeLang();
        }
    }

    async #setId() {
        await this.ready();
        this.viewId = `searcher-view-${this.instanceID}`;
    }

    changeLang() {
        if(this.processWindow) {
            const currentRoute = this.instanceData.route;
            let pathArray = currentRoute.split('/').filter(p => p.length > 0);
            if(pathArray.length > 0 && pathArray[0] === Filesystem.root.desktopName) pathArray.shift();
            const folder = getFolderContent(pathArray);

            let nElements = folder.children.length || 0;
            let itemTxt = nElements !== 1 ? "items" : "item";

            const fnDiv = this.processWindow.win;
            fnDiv.querySelector(".searcher-summary").innerText = `${formatString(LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"][itemTxt], 
                {items: nElements})}, ${formatString(LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["storage"], 
                    {storage: this.instanceData.availableStorage})}`
        }
        if(Finder.#thisComputer) {
            Finder.#thisComputer.changeWindowName(LocalizationManager.getInstance().getStringsFromId("os").buttons.apple.options[0].text);
            Finder.#thisComputer.win.querySelector("#version").innerHTML = `<b>
                ${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["version"]}</b> Mac OS 9.0`;
            Finder.#thisComputer.win.querySelector("#bimemory").innerHTML = `<b>
                ${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["bimemory"]}</b> 1 GB`;
            Finder.#thisComputer.win.querySelector("#vmemory").innerHTML = `<b>
                ${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["vmemory"]}</b> 
                    ${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["on"]}`;
            Finder.#thisComputer.win.querySelector("#lublock").innerHTML = `<b>
                ${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["lublock"]}</b> 5.2 GB`;
        }
    }

    async getBodyHTML() {
        const currentRoute = this.instanceData.route;
        let pathArray = currentRoute.split('/').filter(p => p.length > 0);
        if(pathArray.length > 0 && pathArray[0] === Filesystem.root.desktopName) pathArray.shift();
        const folder = getFolderContent(pathArray);

        let nElements = folder.children.length || 0;
        let itemTxt = nElements !== 1 ? "items" : "item";

        return `
            <div id="finder" class="finder">
                <div class="searcher-summary">${formatString(LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"][itemTxt], 
                    {items: nElements})}, ${formatString(LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["storage"], 
                    {storage: this.instanceData.availableStorage})}</div>
                <div class="searcher-content" id="${this.viewId}"></div>
            </div>
        `;
    }

    renderIcons(){
        const currentRoute = this.instanceData.route;
        let pathArray = currentRoute.split('/').filter(p => p.length > 0);
        if(pathArray.length > 0 && pathArray[0] === Filesystem.root.desktopName) pathArray.shift();
        const folder = getFolderContent(pathArray);
        const container = document.getElementById(this.viewId);
        if(container) container.innerHTML = "";

        if(!folder || !folder.children) {
            document.getElementById(this.viewId).innerHTML = "<p style='padding:10px;'>0 items</p>";
            return;
        }

        folder.children.forEach(item => {
            const childName = item.desktopName || item.name;
            const separator = currentRoute === "/" ? "" : "/";
            const childRoute = `${currentRoute}${separator}${childName}`;
            let itemData = {
                ...item,
                route: childRoute
            };
            new Icon(itemData, this.viewId);
        });
    }

    gainedFocus() {
        if(this.processWindow) this.processWindow.changeWindowName(this.instanceData.desktopName);
        if(!this.rendered) {
            this.renderIcons();
            this.rendered = true;
        }
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Finder.#thisComputer) Finder.#thisComputer = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }
}