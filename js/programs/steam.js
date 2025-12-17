import Program from "../program.js";
import {getRoot, isPromise} from "../utils.js";
import SteamWindow from "../windows/steamwindow.js";
import Arkanoid from "./arkanoid.js";
import Asteroids from "./asteroids.js";
import Galactic from "./galactic.js";
import Navigator from "./navigator.js";
import LocalizationManager from "../localizationmanager.js";
import WindowManager from "../windows/windowmanager.js";


export default class Steam extends Program {

    static gamesWindow = null;
    static loadingGameWindow = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;

        this.addEventListener("closeSubwindow", (e) => {
            switch(e.detail.windowName) {
                case this.interfaceTexts["games"]:
                    Steam.gamesWindow = null;
                    break;
                default:
                    Steam.loadingGameWindow = null;
                    break;
            }
        });

    }

    async createWindow() {
        if(!this.processWindow) {
            return WindowManager.getInstance().createWindow(SteamWindow, this, this.instanceData.width, this.instanceData.height);
        }
        return null;
    }

    changeLang() {
        const steamDiv = document.getElementById(this.instanceID).querySelector("#steam");
        const bG = steamDiv.querySelector("#steam-button-games");
        bG.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["games"];
        bG.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["gamesExplained"];
        const bF = steamDiv.querySelector("#steam-button-friends");
        bF.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["friends"];
        bF.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["friendsExplained"]; 
        const bS = steamDiv.querySelector("#steam-button-servers");
        bS.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["servers"];
        bS.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["serversExplained"]; 
        const bM = steamDiv.querySelector("#steam-button-monitor");
        bM.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["monitor"];
        bM.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["monitorExplained"]; 
        const bSt = steamDiv.querySelector("#steam-button-settings");
        bSt.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["settings"];
        bSt.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["settingsExplained"];
        const bN = steamDiv.querySelector("#steam-button-news");
        bN.querySelector("button").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["news"];
        bN.querySelector("p").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["newsExplained"];

        if(Steam.gamesWindow) {
            Steam.gamesWindow.changeWindowName(LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["games"]);
            const gamesWindow = document.querySelector("#steam-games");
            gamesWindow.querySelector("#my-games h1").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["myGames"];
            gamesWindow.querySelector("#available-games h1").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["availableGames"];
        }
        
        if(LocalizationManager.getInstance().locale === "de_DE") {
            document.documentElement.style.setProperty("--button-text-size", "10px");
            document.documentElement.style.setProperty("--paragraph-text-size", "11px");
        }
        else if(LocalizationManager.getInstance().locale === "es_ES") {
            document.documentElement.style.setProperty("--button-text-size", "12px");
            document.documentElement.style.setProperty("--paragraph-text-size", "11px");
        }
        else {
            document.documentElement.style.setProperty("--button-text-size", "13px");
            document.documentElement.style.setProperty("--paragraph-text-size", "12px");
        }
    }

    async initGame(game) {
        Steam.loadingGameWindow = this.os.openSubwindow(this, game.name + " - Steam", 
            `${getRoot()}html/programs/steam/loading.html`,
            Steam.width / 1.5, Steam.height / 4, Steam.width / 1.5, Steam.height);
        Steam.loadingGameWindow = await Steam.loadingGameWindow;
        const loadingWindow = document.querySelector("#steam-loading");
        let textToDisplay = this.os.locale === "de_DE" ? game.name + this.interfaceTexts["preparing"] : 
            this.interfaceTexts["preparing"] + game.name;
        loadingWindow.querySelector("#loading-text").textContent = textToDisplay;
                                
        setTimeout(() => {
            if(Steam.loadingGameWindow != null) {
                this.os.closeSubwindow(Steam.loadingGameWindow.id);
                Steam.loadingGameWindow.close();
                Steam.loadingGameWindow = null;
                setTimeout(() => {
                    this.os.openWindow(game, false);
                }, 1000);
            }
        }, 3000);
    }

    async initWebgame(game) {
        Steam.loadingGameWindow = this.os.openSubwindow(this, game.name + " - Steam", 
            `${getRoot()}html/programs/steam/loading.html`,
            Steam.width / 1.5, Steam.height / 4, Steam.width / 1.5, Steam.height);
        Steam.loadingGameWindow = await Steam.loadingGameWindow;
        const loadingWindow = document.querySelector("#steam-loading");
        let textToDisplay = this.os.locale === "de_DE" ? game.name + this.interfaceTexts["preparing"] : 
            this.interfaceTexts["preparing"] + game.name;
        loadingWindow.querySelector("#loading-text").textContent = textToDisplay;

        setTimeout(() => {
            if(Steam.loadingGameWindow != null) {
                this.os.closeSubwindow(Steam.loadingGameWindow.id);
                Steam.loadingGameWindow.close();
                Steam.loadingGameWindow = null;
                setTimeout(async () => {
                    let wind = this.os.openWindow(Navigator);
                    wind = await wind;
                    wind.addEventListener("ready", (e) => {
                        wind.program.navigate(game);
                    });
                }, 1000);
            }
        }, 3000);
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
                    gamesWindow.querySelector("#game-galactic img").src = `${getRoot()}assets/icons/programs/galactic.png`;
                    gamesWindow.querySelector("#game-erpg img").src = `${getRoot()}assets/icons/programs/erpg.png`;
                    gamesWindow.querySelector("#game-chillout img").src = `${getRoot()}assets/icons/programs/chillout.png`;
                    gamesWindow.querySelector("#game-ott img").src = `${getRoot()}assets/icons/programs/ott.png`;
                    gamesWindow.querySelector("#game-geoguide img").src = `${getRoot()}assets/icons/programs/geoguide.png`;
                    gamesWindow.querySelector("#game-damn img").src = `${getRoot()}assets/icons/programs/damn.png`;
                    gamesWindow.querySelector("#game-ctp img").src = `${getRoot()}assets/icons/programs/ctp.bmp`;
                    gamesWindow.querySelector("#my-games h1").textContent = this.interfaceTexts["myGames"];
                    gamesWindow.querySelector("#available-games h1").textContent = this.interfaceTexts["availableGames"];

                    gamesWindow.querySelectorAll(".steam-game").forEach(button => {
                        button.addEventListener("click", async () => {
                            if(!button.classList.contains("gameselected")) {
                                gamesWindow.querySelectorAll(".steam-game").forEach(bt2 => {
                                    bt2.dispatchEvent(new CustomEvent("unclicked", {}));
                                });
                                button.classList.add('gameselected');
                            }
                            else {
                                button.classList.remove("gameselected");
                                if(button.id === "game-arkanoid") this.initGame(Arkanoid);
                                else if(button.id === "game-asteroids") this.initGame(Asteroids);
                                else if(button.id === "game-galactic") this.initGame(Galactic);
                                else if(button.id === "game-erpg") this.initWebgame(ERPG);
                            }
                        });
                        button.addEventListener("unclicked", () => {
                            button.classList.remove("gameselected");
                        });
                    });
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
        if(Steam.loadingGameWindow) {
            this.os.closeSubwindow(Steam.loadingGameWindow.id);
            Steam.loadingGameWindow.close();
            Steam.loadingGameWindow = null;
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