import Program from "../program.js";
import {getRoot} from "../utils.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";
import ProcessManager from "../processmanager.js";

export default class Asteroids extends Program {

    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);
        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
            closeWindow : () => ProcessManager.getInstance().killProcess(this.pid)
        };
    }

    async #showAboutInfo() {
        if(!Asteroids.#info) {
            Asteroids.#info = WindowManager.getInstance().createWindow(Subwindow, this, 800, 200, 800, 200, 
                {name: LocalizationManager.getInstance().getStringsFromId("asteroids").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/asteroids/about.html`});
            Asteroids.#info = await Asteroids.#info;
            this.changeLang();
        } 
    }

    changeLang() {
        if(Asteroids.#info) {
            Asteroids.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("asteroids").buttons.help.options[0].text);
            Asteroids.#info.win.querySelector("#asteroids-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("asteroids").buttons.help.options[0].authors}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("asteroids").buttons.help.options[0].expl}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("asteroids").buttons.help.options[0].tech}</p>
            `;
        }        
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/asteroids/asteroids.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Asteroids.#info) Asteroids.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }

    async onClose() {
        this.closeSubwindow(Asteroids.#info);
    }
}