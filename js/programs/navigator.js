import Program from "../program.js";
import {getRoot} from "../utils.js";
import ERPG from "./erpg.js";
import NetscapeWeb from "./netscape_default.js";


export default class Navigator extends Program {

    static icon = "navigator.png";
    static id = "navigator";
    static name = "Navigator";
    static unique = false;
    static appClass = "program";

    constructor(os) {
        super(os, Navigator.name, Navigator.id, Navigator.icon, "desktop");

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;

        this.specialURLS = new Map();
        this.specialURLS.set(ERPG.urlpage, ERPG);
        this.specialURLS.set(NetscapeWeb.urlpage, NetscapeWeb);

        this.addEventListener("localeSet", (e) => {
            this.setLanguage(os.locale);
            this.getProgramData();
        });

        this.addEventListener("langChanged", () => {
            const navDiv = document.getElementById(this.instanceID).querySelector("#navigator");
            navDiv.querySelector("#left-buttons button:nth-child(1) .label").innerText = this.interfaceTexts["back"];
            navDiv.querySelector("#left-buttons button:nth-child(2) .label").innerText = this.interfaceTexts["forward"];
            navDiv.querySelector("#left-buttons button:nth-child(3) .label").innerText = this.interfaceTexts["home"];
            navDiv.querySelector("#right-buttons button:nth-child(1) .label").innerText = this.interfaceTexts["reload"];
            navDiv.querySelector("#right-buttons button:nth-child(2) .label").innerText = this.interfaceTexts["stop"];
            navDiv.querySelector("#url p").innerText = this.interfaceTexts["location"];
        });

    }

    async getProgramData() {
        await this.langReady();
        const programData = this.searchForProgramInData();
        if(programData) {
            this.strings = programData["texts"]["buttons"];
            this.interfaceTexts = programData["texts"]["interface"];
        } else {
            console.warn("No data found for program", this.id);
            this.strings = {};
        }
        this.os.dispatchEvent(new CustomEvent("langLoaded", {}));
        this.dispatchEvent(new CustomEvent("langChanged", {}));
    }

    gainedFocus() {
        const win = document.getElementById(this.instanceID);
        const navigatorDiv = win.querySelector("#navigator");
        this.backButton = navigatorDiv.querySelector("#left-buttons button:nth-child(1)");
        this.forwardButton = navigatorDiv.querySelector("#left-buttons button:nth-child(2)");
        this.homeButton = navigatorDiv.querySelector("#left-buttons button:nth-child(3)");
        this.reloadButton = navigatorDiv.querySelector("#right-buttons button:nth-child(1)");
        this.stopButton = navigatorDiv.querySelector("#right-buttons button:nth-child(2)");
        this.urlInput = navigatorDiv.querySelector("#url input");
        this.iframe = navigatorDiv.querySelector("#content iframe");
        this.statusBar = navigatorDiv.querySelector("#statusbar");

        if(!this.addedListeners) {
            this.backButton.addEventListener("click", () => {
                if(this.currentIndex > 0) {
                    this.currentIndex--;
                    this.iframe.src = this.historyStack[this.currentIndex];
                    this.#updateButtons();
                }
            });

            this.forwardButton.addEventListener("click", () => {
                if(this.currentIndex < this.historyStack.length - 1) {
                    this.currentIndex++;
                    this.iframe.src = this.historyStack[this.currentIndex];
                    this.#updateButtons();
                }
            });

            this.homeButton.addEventListener("click", () => {
                this.navigate(NetscapeWeb);
            })

            this.reloadButton.addEventListener("click", () => {
                this.iframe.src = this.iframe.src;
            });

            this.stopButton.addEventListener("click", () => {
                this.navigate("about:blank");
            });

            this.urlInput.addEventListener("keypress", (e) => {
                if(e.key === "Enter") {
                    this.navigate(this.urlInput.value);
                }
            });

            this.iframe.addEventListener("load", () => {
                this.stopButton.disabled = true;
                this.#updateButtons();
            });

            this.addedListeners = true;
            this.#updateButtons();
            this.navigate(NetscapeWeb);
        }
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/navigator/navigator.html`);
        return await response.text();
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }

    getButtons() {
        return this.strings;
    }

    navigate(url) {
        if(typeof url === "string") {
            if(this.specialURLS.get(url) !== undefined) return this.navigate(this.specialURLS.get(url));
            this.iframe.src = url;
            this.urlInput.value = url;
            this.statusBar.textContent = "Loading...";

            this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
            this.historyStack.push(url);
            this.currentIndex++;
            this.stopButton.disabled = false;

            this.#updateButtons();
        }
        else {
            this.iframe.src = url.src;
            this.urlInput.value = url.urlpage;
            this.statusBar.textContent = "Loading...";

            this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
            this.historyStack.push(url.src);
            this.currentIndex++;
            this.stopButton.disabled = false;

            this.#updateButtons();
        }
    }

    #updateButtons() {
        this.homeButton.querySelector("img").src = `${getRoot()}assets/icons/programs/navigator/home.png`;
        this.reloadButton.querySelector("img").src = `${getRoot()}assets/icons/programs/navigator/reload.png`;
        this.backButton.disabled = this.currentIndex <= 0;
        this.backButton.querySelector("img").src = this.backButton.disabled ? `${getRoot()}assets/icons/programs/navigator/back.png` : `${getRoot()}assets/icons/programs/navigator/back_active.png`;
        this.forwardButton.disabled = this.currentIndex >= this.historyStack.length - 1;
        this.forwardButton.querySelector("img").src = this.forwardButton.disabled ? `${getRoot()}assets/icons/programs/navigator/forward.png` : `${getRoot()}assets/icons/programs/navigator/forward_active.png`;
        this.reloadButton.disabled = false;
        this.stopButton.querySelector("img").src = this.stopButton.disabled ? `${getRoot()}assets/icons/programs/navigator/stop.png` : `${getRoot()}assets/icons/programs/navigator/stop_active.png`;
    }
}