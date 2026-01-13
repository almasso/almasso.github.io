import { Filesystem, getFolderContent } from "../filesystem.js";
import Program from "../program.js";
import {getRoot, formatString} from "../utils.js";
import Icon from "../icon.js";
import LocalizationManager from "../localizationmanager.js";
import WindowManager from "../windows/windowmanager.js";
import Subwindow from "../windows/subwindow.js";
import AlertSW from "../windows/alert.js";
import OS from "../os.js";

export default class Finder extends Program {
    static #thisComputer = null;
    static #restartComputer = null;
    static #shutdownComputer = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);
        if(!this.instanceData.route || this.instanceData.route.includes("undefined")) {
            this.instanceData.route = "/Macintosh HD";
            this.instanceData.desktopName = "Macintosh HD";
        }
        this.#setId();
        this.rendered = false;

        this.functionMap = {
            showAbout : () => this.#showAboutInfo(),
            sleepWebsite : () => this.#sleepWebsite(),
            restartWebsite : () => this.#restartWebsite(),
            closeWebsite : () => this.#closeWebsite()
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

    #sleepWebsite() {
        OS.getInstance().sleepWebsite();
    }

    async #restartWebsite() {
        if(!Finder.#restartComputer) {
            Finder.#restartComputer = WindowManager.getInstance().createWindow(AlertSW, this, 500, 130, 500, 130, 
                {name: LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[6].text, contentRoute: `${getRoot()}html/system/restart.html`});
            Finder.#restartComputer = await Finder.#restartComputer;

            Finder.#restartComputer.win.querySelector("button#cancel").addEventListener("click", () => Finder.#restartComputer.close());
            Finder.#restartComputer.win.querySelector("button#restart").addEventListener("click", () => window.location.reload());
            this.changeLang();
        }
    }

    async #closeWebsite() {
        if(!Finder.#shutdownComputer) {
            Finder.#shutdownComputer = WindowManager.getInstance().createWindow(AlertSW, this, 500, 130, 500, 130, 
                {name: LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].text, contentRoute: `${getRoot()}html/system/shutdown.html`});
            Finder.#shutdownComputer = await Finder.#shutdownComputer;

            Finder.#shutdownComputer.win.querySelector("button#cancel").addEventListener("click", () => Finder.#shutdownComputer.close());
            Finder.#shutdownComputer.win.querySelector("button#restart").addEventListener("click", () => window.location.reload());
            Finder.#shutdownComputer.win.querySelector("button#sleep").addEventListener("click", () => this.#sleepWebsite());
            Finder.#shutdownComputer.win.querySelector("button#shutdown").addEventListener("click", () => close());
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

            Finder.#thisComputer.win.querySelector("#computer-sizes").innerHTML = `
                <div class="memory-row">
                    <div class="app-info">
                        <span>${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["copy"]}</span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span>${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["ip"]}</span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span>${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["expl"]}</span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span>&nbsp</span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>${LocalizationManager.getInstance().getStringsFromId("finder")["texts"]["interface"]["resources"]}</b></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>Infinite Mac</b> - <a href="https://infinitemac.org/" target="_blank">https://infinitemac.org</a></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>Siddharta77 OS9</b> - <a href="https://os9.ca" target="_blank">https://os9.ca</a></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>Apple Garamond</b> - <a href="https://online-fonts.com/fonts/apple-garamond" target="_blank">https://online-fonts.com/fonts/apple-garamond</a></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>Chicago</b> - <a href="https://www.1001freefonts.com/es/chicago.font" target="_blank">https://www.1001freefonts.com/es/chicago.font</a></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span><b>Apple II</b> - <a href="https://www.kreativekorp.com/software/fonts/apple2/" target="_blank">https://www.kreativekorp.com/software/fonts/apple2/</a></span>
                    </div>
                </div>
                <div class="memory-row">
                    <div class="app-info">
                        <span>&nbsp</span>
                    </div>
                </div>
            `;
        }

        if(Finder.#restartComputer) {
            Finder.#restartComputer.win.querySelector("#restart-text").innerHTML = `
                <b>${LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[6].restart}</b>
                <small>${LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[6].reload}</small>
            `
            Finder.#restartComputer.win.querySelector("button#cancel").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[6].cancel;
            Finder.#restartComputer.win.querySelector("button#restart").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[6].rstbtn;
        }

        if(Finder.#shutdownComputer) {
            Finder.#shutdownComputer.win.querySelector("#restart-text").innerHTML = `
                <b>${LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].shutdown}</b>
                <small>${LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].close}</small>
            `
            Finder.#shutdownComputer.win.querySelector("button#cancel").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].cancel;
            Finder.#shutdownComputer.win.querySelector("button#restart").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].restart;
            Finder.#shutdownComputer.win.querySelector("button#sleep").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].sleep;
            Finder.#shutdownComputer.win.querySelector("button#shutdown").innerText = LocalizationManager.getInstance().getStringsFromId("finder").buttons.special.options[7].sdbtn;
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
            else if(sw === Finder.#restartComputer) Finder.#restartComputer = null;
            else if(sw === Finder.#shutdownComputer) Finder.#shutdownComputer = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }
}