import Program from "../program.js";
import {getRoot, isPromise} from "../utils.js";
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
                case this.interfaceTexts["games"]:
                    Steam.gamesWindow = null;
                    break;
            }
        });

        this.addEventListener("langChanged", () => {
            const steamDiv = document.getElementById(this.instanceID).querySelector("#steam");
            const bG = steamDiv.querySelector("#steam-button-games");
            bG.querySelector("button").innerText = this.interfaceTexts["games"];
            bG.querySelector("p").textContent = this.interfaceTexts["gamesExplained"];
            const bF = steamDiv.querySelector("#steam-button-friends");
            bF.querySelector("button").innerText = this.interfaceTexts["friends"];
            bF.querySelector("p").textContent = this.interfaceTexts["friendsExplained"]; 
            const bS = steamDiv.querySelector("#steam-button-servers");
            bS.querySelector("button").innerText = this.interfaceTexts["servers"];
            bS.querySelector("p").textContent = this.interfaceTexts["serversExplained"]; 
            const bM = steamDiv.querySelector("#steam-button-monitor");
            bM.querySelector("button").innerText = this.interfaceTexts["monitor"];
            bM.querySelector("p").textContent = this.interfaceTexts["monitorExplained"]; 
            const bSt = steamDiv.querySelector("#steam-button-settings");
            bSt.querySelector("button").innerText = this.interfaceTexts["settings"];
            bSt.querySelector("p").textContent = this.interfaceTexts["settingsExplained"];
            const bN = steamDiv.querySelector("#steam-button-news");
            bN.querySelector("button").innerText = this.interfaceTexts["news"];
            bN.querySelector("p").textContent = this.interfaceTexts["newsExplained"];

            if(Steam.gamesWindow) {
                Steam.gamesWindow.changeWindowName(this.interfaceTexts["games"]);
                const gamesWindow = document.querySelector("#steam-games");
                gamesWindow.querySelector("#my-games h1").textContent = this.interfaceTexts["myGames"];
                gamesWindow.querySelector("#available-games h1").textContent = this.interfaceTexts["availableGames"];
            }
            
            if(os.locale === "de_DE") {
                document.documentElement.style.setProperty("--button-text-size", "10px");
                document.documentElement.style.setProperty("--paragraph-text-size", "11px");
            }
            else if(os.locale === "es_ES") {
                document.documentElement.style.setProperty("--button-text-size", "12px");
                document.documentElement.style.setProperty("--paragraph-text-size", "11px");
            }
            else {
                document.documentElement.style.setProperty("--button-text-size", "13px");
                document.documentElement.style.setProperty("--paragraph-text-size", "12px");
            }
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

    #changeUITexts() {

    }

    gainedFocus() {
        const win = document.getElementById(this.instanceID);
        const steamDiv = win.querySelector("#steam");

        if(!this.addedListeners) {
            steamDiv.querySelector("#steam-button-games button").addEventListener("click", async () => {
                if(!Steam.gamesWindow) {
                    Steam.gamesWindow = this.os.openSubwindow(this, this.interfaceTexts["games"], `${getRoot()}html/programs/steam/games.html`, 
                    Steam.width / 1.5, Steam.height, Steam.width / 1.5, Steam.height);
                    Steam.gamesWindow = await Steam.gamesWindow;

                    const gamesWindow = document.querySelector("#steam-games");
                    gamesWindow.querySelector("#game-arkanoid img").src = `${getRoot()}assets/icons/programs/arkanoid.png`;
                    gamesWindow.querySelector("#game-asteroids img").src = `${getRoot()}assets/icons/programs/asteroids.png`;
                    gamesWindow.querySelector("#game-arkanoid img").src = `${getRoot()}assets/icons/programs/arkanoid.png`;
                    gamesWindow.querySelector("#game-erpg img").src = `${getRoot()}assets/icons/programs/erpg.png`;
                    gamesWindow.querySelector("#game-chillout img").src = `${getRoot()}assets/icons/programs/chillout.png`;
                    gamesWindow.querySelector("#game-ott img").src = `${getRoot()}assets/icons/programs/ott.png`;
                    gamesWindow.querySelector("#game-geoguide img").src = `${getRoot()}assets/icons/programs/geoguide.png`;
                    gamesWindow.querySelector("#game-damn img").src = `${getRoot()}assets/icons/programs/damn.png`;
                    gamesWindow.querySelector("#game-ctp img").src = `${getRoot()}assets/icons/programs/ctp.bmp`;
                    gamesWindow.querySelector("#my-games h1").textContent = this.interfaceTexts["myGames"];
                    gamesWindow.querySelector("#available-games h1").textContent = this.interfaceTexts["availableGames"];
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