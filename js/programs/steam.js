import Program from "../program.js";
import {getRoot} from "../utils.js";
import SteamWindow from "../windows/steamwindow.js";


export default class Steam extends Program {

    static icon = "steam.png";
    static id = "steam";
    static name = "Steam";
    static unique = true;
    static width = 420;
    static height = 320;

    static gamesWindow = null;

    constructor(os, name = Steam.name) {
        super(os, name, Steam.id, Steam.icon, "desktop");

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;

        this.addEventListener("localeSet", (e) => {
            this.setLanguage(os.locale);
            this.getProgramData();
        });

        this.addEventListener("closeSubwindow", (e) => {
            switch(e.detail.windowName) {
                case "Games":
                    Steam.gamesWindow = null;
                    break;
            }
        });
    }

    async getProgramData() {
        await this.langReady();
        const programData = this.searchForProgramInData();
        if(programData) {
            this.strings = programData["texts"];
        } else {
            console.warn("No data found for program", this.id);
            this.strings = {};
        }
        this.os.dispatchEvent(new CustomEvent("langLoaded", {}));
    }

    gainedFocus() {
        const win = document.getElementById(this.instanceID);
        const steamDiv = win.querySelector("#steam");

        if(!this.addedListeners) {
            steamDiv.querySelector("#steam-button-games button").addEventListener("click", () => {
                if(!Steam.gamesWindow) {
                    Steam.gamesWindow = this.os.openSubwindow(this, "Games", `${getRoot()}html/programs/steam/games.html`, 
                    Steam.width / 1.5, Steam.height, Steam.width / 1.5, Steam.height);
                }
            });
            steamDiv.querySelector("#steam-button-friends button").addEventListener("click", () => {
            });
            steamDiv.querySelector("#steam-button-servers button").addEventListener("click", () => {
            });
            steamDiv.querySelector("#steam-button-monitor button").addEventListener("click", () => {
            });
            steamDiv.querySelector("#steam-button-settings button").addEventListener("click", () => {
            });
            steamDiv.querySelector("#steam-button-news button").addEventListener("click", () => {
            });
            this.addedListeners = true;
        }
    }

    async onClose() {
        if(Steam.gamesWindow) {
            Steam.gamesWindow = await Steam.gamesWindow;
            this.os.closeSubwindow(Steam.gamesWindow.id);
            Steam.gamesWindow.close();
            Steam.gamesWindow = null;
        }
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/steam/steam.html`);
        return await response.text();
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }

    getButtons() {
        return this.strings;
    }
}