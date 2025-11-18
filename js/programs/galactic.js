import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Galactic extends Program {

    static icon = "galactic.png";
    static id = "galactic";
    static name = "The Galactic Plague";
    static unique = true;
    static width = 1280;
    static height = 720;
    static appClass = "game";

    constructor(os) {
        super(os, Galactic.name, Galactic.id, Galactic.icon, "desktop");
        this.addEventListener("localeSet", (e) => {
            this.setLanguage(os.locale);
            this.getProgramData();
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

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/galactic.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    getButtons() {
        return this.strings;
    }

    static getIcons() {
        return [{route : "desktop", isAlias : true}]
    }
}