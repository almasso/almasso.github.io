import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Asteroids extends Program {

    static icon = "asteroids.png";
    static id = "asteroids";
    static name = "Asteroids";
    static unique = true;
    static width = 800;
    static height = 620;
    static appClass = "game";

    constructor(os) {
        super(os, Asteroids.name, Asteroids.id, Asteroids.icon, "desktop");
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
        return `<iframe src="${getRoot()}html/programs/asteroids.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    getButtons() {
        return this.strings;
    }

    static getIcons() {
        return [{route : "desktop", isAlias : true}]
    }
}