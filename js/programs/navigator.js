import Program from "../program.js";
import {getRoot} from "../utils.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";
import ProcessManager from "../processmanager.js";


export default class Navigator extends Program {

    static #specialNames = new Map([
        ["home", "http://home.mcom.com/home/welcome.html"],
        ["erpg", "http://www.erpg.manininteractive.com"]
    ]);
    static #specialURLS = new Map([
        ["http://home.mcom.com/home/welcome.html", `${getRoot()}html/programs/navigator/navigator_assets/welcome.html`],
        ["http://www.erpg.manininteractive.com", `${getRoot()}html/programs/erpg/erpg.html`]
    ]);

    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;
        this.previousIndex = 0;
        this.addingPage = true;

        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
            newSession : () => Navigator.launch(this.instanceData),
            closeWindow : () => ProcessManager.getInstance().killProcess(this.pid),
            reload : () => this.iframe.src = this.iframe.src,
            goBack : () => this.#goBack(),
            goForward : () => this.#goForward(),
            goHome : () => this.navigate(Navigator.#specialNames.get("home")),
            goToWebsite : (attr) => this.navigate(Navigator.#specialNames.get(attr))
        };
    }

    async #showAboutInfo() {
        if(!Navigator.#info) {
            Navigator.#info = WindowManager.getInstance().createWindow(Subwindow, this, 650, 350, 650, 350, 
                {name: LocalizationManager.getInstance().getStringsFromId("navigator").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/navigator/about.html`});
            Navigator.#info = await Navigator.#info;
            this.changeLang();
        }
    }

    changeLang() {
        const navDiv = document.getElementById(this.instanceID).querySelector("#navigator");
        navDiv.querySelector("#left-buttons button:nth-child(1) .label").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["back"];
        navDiv.querySelector("#left-buttons button:nth-child(2) .label").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["forward"];
        navDiv.querySelector("#left-buttons button:nth-child(3) .label").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["home"];
        navDiv.querySelector("#right-buttons button:nth-child(1) .label").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["reload"];
        navDiv.querySelector("#right-buttons button:nth-child(2) .label").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["stop"];
        navDiv.querySelector("#url p").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["location"];
        
        if(Navigator.#info) {
            Navigator.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("navigator").buttons.help.options[0].text);
            Navigator.#info.win.querySelector("#copy-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("navigator").buttons.help.options[0].ns}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("navigator").buttons.help.options[0].expl}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("navigator").buttons.help.options[0].aff}</p>
            `;
        }
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
                this.#goBack();
            });

            this.forwardButton.addEventListener("click", () => {
                this.#goForward();
            });

            this.homeButton.addEventListener("click", () => {
                this.navigate(Navigator.#specialNames.get("home"));
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
            this.navigate(this.instanceData.metadata.specialURL);
        }
        this.changeLang();
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/navigator/navigator.html`);
        return await response.text();
    }

    navigate(url) {
        this.iframe.src = Navigator.#specialURLS.has(url) ? Navigator.#specialURLS.get(url) : url;
        this.urlInput.value = url;
        this.statusBar.textContent = "Loading...";

        if(this.addingPage) {
            this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
            this.historyStack.push(url);
            this.currentIndex++;
        }
        
        this.stopButton.disabled = false;
        this.#updateButtons();
        this.addingPage = true;
    }

    #goBack() {
        if(this.currentIndex > 0) {
            this.currentIndex--;
            this.addingPage = false;
            this.navigate(this.historyStack[this.currentIndex]);
            this.#updateButtons();
        }
    }
    
    #goForward() {
        if(this.currentIndex < this.historyStack.length - 1) {
            this.addingPage = false;
            this.currentIndex++;
            this.navigate(this.historyStack[this.currentIndex]);
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

    async onClose() {
        this.closeSubwindow(Navigator.#info);
    }
    
    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Navigator.#info) Navigator.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }
}