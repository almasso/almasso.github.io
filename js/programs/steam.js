import Program from "../program.js";
import {getRoot, formatString} from "../utils.js";
import SteamWindow from "../windows/steamwindow.js";
import SteamSubwindow from "../windows/steamsubwindow.js";
import LocalizationManager from "../localizationmanager.js";
import WindowManager from "../windows/windowmanager.js";
import { ClassMap } from "../registry.js";
import { Filesystem, findNodeByProgramId, findAllNodesByProgramId } from "../filesystem.js";
import Icon from "./../icon.js";


export default class Steam extends Program {

    static gamesWindow = null;
    static loadingGameWindow = null;
    static #info = null;

    #FnMap = {
        "game" : this.initGame.bind(this),
        "webgame" : this.initWebgame.bind(this)
    };

    constructor(processId, instanceData) {
        super(processId, instanceData);

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;
        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
        };
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
            gamesWindow.querySelector("#game-galactic p").textContent = LocalizationManager.getInstance().locale === "es_ES" ? "La Plaga Galáctica" : "The Galactic Plague";
        }

        if(Steam.loadingGameWindow) {
            const loadingWindow = document.querySelector("#steam-loading");
            const lgwTitle = loadingWindow.parentElement.parentElement.querySelector(".steam-window-title").innerText;
            let textToDisplay = formatString(LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["preparing"], {game: lgwTitle.split(" ")[0]});
            loadingWindow.querySelector("#loading-text").textContent = textToDisplay;
        }

        if(Steam.#info) {
            Steam.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("steam").buttons.help.options[0].text);
            Steam.#info.win.querySelector("#steam-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("steam").buttons.help.options[0].valve}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("steam").buttons.help.options[0].expl}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("steam").buttons.help.options[0].aff}</p>
            `;
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

    async #openLoadingWindow(gameTitle) {
        Steam.loadingGameWindow = WindowManager.getInstance().createWindow(SteamSubwindow, this,
            this.instanceData.width / 1.5, this.instanceData.height / 4, this.instanceData.width / 1.5, this.instanceData.height / 4, 
            {name: `${gameTitle} - Steam`, contentRoute: `${getRoot()}html/programs/steam/loading.html`});
        Steam.loadingGameWindow = await Steam.loadingGameWindow;
        const loadingWindow = document.querySelector("#steam-loading");
        let textToDisplay = formatString(LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["preparing"], {game: gameTitle});
        loadingWindow.querySelector("#loading-text").textContent = textToDisplay;
    }

    /**
     * 
     * @param {Object} game Registry app name
     */
    async initGame(rg) {
        let game = Filesystem.registry[rg];
        await this.#openLoadingWindow(game.name);

        setTimeout(() => {
            if(Steam.loadingGameWindow != null) {
                WindowManager.getInstance().remove(Steam.loadingGameWindow.id);
                Steam.loadingGameWindow = null;
                setTimeout(() => {
                    const fileResult = findNodeByProgramId(rg);
                    let launchData = {};
                    if(fileResult) launchData = {...game, ...fileResult.node, route: fileResult.path, metadata: {...(fileResult.node.metadata || {}), unique: true}};
                    const AppClass = ClassMap[game.classRef];
                    Icon.selectIcon(launchData);
                    if(AppClass) AppClass.launch(launchData);
                }, 1000);
            }
        }, 3000);
    }

    /**
     * 
     * @param {String} web Web to open
     */
    async initWebgame(web) {
        let nv = Filesystem.registry["navigator"];
        const allNavs = findAllNodesByProgramId("navigator");

        const targetGame = allNavs.find(match => {
            if(match.node.steamId && match.node.steamId === web) return true;
            else return false;
        });

        if(targetGame) {
            await this.#openLoadingWindow(targetGame.node.desktopName);

            setTimeout(() => {
                if(Steam.loadingGameWindow != null) {
                    WindowManager.getInstance().remove(Steam.loadingGameWindow.id);
                    Steam.loadingGameWindow = null;
                    setTimeout(async () => {
                        let launchData = {};
                        if(targetGame) launchData = {...nv, ...targetGame.node, route: targetGame.path, metadata:{...(targetGame.node.metadata || {}), unique: true}};
                        const AppClass = ClassMap[nv.classRef];
                        if(AppClass) AppClass.launch(launchData);
                    }, 1000);
                }
            }, 3000);
        }
    }

    async #openGamesWindow() {
        Steam.gamesWindow = WindowManager.getInstance().createWindow(SteamSubwindow, this,
            this.instanceData.width / 1.5, this.instanceData.height, this.instanceData.width / 1.5, this.instanceData.height, 
            {name: LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["games"], contentRoute: `${getRoot()}html/programs/steam/games.html`});

        Steam.gamesWindow = await Steam.gamesWindow;
        
        const gamesWindow = document.querySelector("#steam-games");
        gamesWindow.querySelector("#game-arkanoid img").src = `${getRoot()}assets/icons/programs/arkanoid.png`;
        gamesWindow.querySelector("#game-asteroids img").src = `${getRoot()}assets/icons/programs/asteroids.png`;
        gamesWindow.querySelector("#game-galactic img").src = `${getRoot()}assets/icons/programs/galactic.png`;
        gamesWindow.querySelector("#webgame-erpg img").src = `${getRoot()}assets/icons/programs/erpg.png`;
        gamesWindow.querySelector("#game-chillout img").src = `${getRoot()}assets/icons/programs/chillout.png`;
        gamesWindow.querySelector("#game-ott img").src = `${getRoot()}assets/icons/programs/ott.png`;
        gamesWindow.querySelector("#game-geoguide img").src = `${getRoot()}assets/icons/programs/geoguide.png`;
        gamesWindow.querySelector("#game-damn img").src = `${getRoot()}assets/icons/programs/damn.png`;
        gamesWindow.querySelector("#game-ctp img").src = `${getRoot()}assets/icons/programs/ctp.bmp`;
        gamesWindow.querySelector("#my-games h1").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["myGames"];
        gamesWindow.querySelector("#available-games h1").textContent = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["availableGames"];
        gamesWindow.querySelector("#game-galactic p").textContent = LocalizationManager.getInstance().locale === "es_ES" ? "La Plaga Galáctica" : "The Galactic Plague";

        gamesWindow.querySelectorAll(".steam-game:not(.game-not-available)").forEach(button => {
            button.addEventListener("click", async () => {
                if(!button.classList.contains("gameselected")) {
                    gamesWindow.querySelectorAll(".steam-game").forEach(bt2 => {
                        bt2.dispatchEvent(new CustomEvent("unclicked", {}));
                    });
                    button.classList.add('gameselected');
                }
                else {
                    button.classList.remove("gameselected");
                    this.#FnMap[button.id.split("-")[0]](button.id.split("-")[1]);
                }
            });
            button.addEventListener("unclicked", () => {
                button.classList.remove("gameselected");
            });
        });

        gamesWindow.querySelectorAll(".steam-game.game-not-available").forEach(button => {
            button.addEventListener("click", () => {
                if(!button.classList.contains("gameselected")) {
                    gamesWindow.querySelectorAll(".steam-game").forEach(bt2 => {
                        bt2.dispatchEvent(new CustomEvent("unclicked", {}));
                    });
                    button.classList.add('gameselected');
                }
                else {
                    button.classList.remove("gameselected");
                    open(button.dataset.url, "_blank");
                }
            });
            button.addEventListener("unclicked", () => {
                button.classList.remove("gameselected");
            });
        });
    }

    async #showAboutInfo() {
        if(!Steam.#info) {
            Steam.#info = WindowManager.getInstance().createWindow(SteamSubwindow, this, this.instanceData.width, 280, this.instanceData.width, 280, 
                {name: LocalizationManager.getInstance().getStringsFromId("steam").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/steam/about.html`});
            Steam.#info = await Steam.#info;
            this.changeLang();
        }        
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Steam.gamesWindow) Steam.gamesWindow = null;
            else if(sw === Steam.loadingGameWindow) Steam.loadingGameWindow = null;
            else if(sw === Steam.#info) Steam.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }

    gainedFocus() {
        if(this.processWindow) {
            const win = document.getElementById(this.instanceID);
            const steamDiv = win.querySelector("#steam");

            if(!this.addedListeners) {
                steamDiv.querySelector("#steam-button-games button").addEventListener("click", async () => {
                    if(!Steam.gamesWindow) await this.#openGamesWindow();
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
                this.changeLang();
            }
        }
    }

    async onClose() {
        this.closeSubwindow(Steam.loadingGameWindow);
        this.closeSubwindow(Steam.gamesWindow);
        this.closeSubwindow(Steam.#info);
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/steam/steam.html`);
        return await response.text();
    }

}