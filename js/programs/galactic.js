import Program from "../program.js";
import {getRoot} from "../utils.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";
import ProcessManager from "../processmanager.js";

export default class Galactic extends Program {

    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);
        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
            closeWindow : () => ProcessManager.getInstance().killProcess(this.pid)
        };
    }

    async #showAboutInfo() {
        if(!Galactic.#info) {
            Galactic.#info = WindowManager.getInstance().createWindow(Subwindow, this, 800, 280, 800, 280, 
                {name: LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/galactic/about.html`});
            Galactic.#info = await Galactic.#info;
            this.changeLang();
        } 
    }

    changeLang() {
        if(Galactic.#info) {
            Galactic.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].text);
            Galactic.#info.win.querySelector("#galactic-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].authors}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].expl}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].tech}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("galactic").buttons.help.options[0].trib}</p>
            `;
        }
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/galactic/galactic.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Galactic.#info) Galactic.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }

    async onClose() {
        this.closeSubwindow(Galactic.#info);
    }
}