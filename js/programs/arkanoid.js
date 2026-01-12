import Program from "../program.js";
import {getRoot} from "../utils.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";

export default class Arkanoid extends Program {

    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);
        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
        };
    }

    async #showAboutInfo() {
        if(!Arkanoid.#info) {
            Arkanoid.#info = WindowManager.getInstance().createWindow(Subwindow, this, 800, 200, 800, 200, 
                {name: LocalizationManager.getInstance().getStringsFromId("arkanoid").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/arkanoid/about.html`});
            Arkanoid.#info = await Arkanoid.#info;
            this.changeLang();
        } 
    }

    changeLang() {
        if(Arkanoid.#info) {
            Arkanoid.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("arkanoid").buttons.help.options[0].text);
            Arkanoid.#info.win.querySelector("#arkanoid-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("arkanoid").buttons.help.options[0].authors}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("arkanoid").buttons.help.options[0].expl}</p>
                <hr>
                <p>${LocalizationManager.getInstance().getStringsFromId("arkanoid").buttons.help.options[0].tech}</p>
            `;
        }
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/arkanoid/arkanoid.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Arkanoid.#info) Arkanoid.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }

    async onClose() {
        this.closeSubwindow(Arkanoid.#info);
    }
}