import Program from "../program.js";
import {getRoot} from "../utils.js";


export default class Steam extends Program {

    static icon = "steam.png";
    static id = "steam";
    static name = "Steam";
    static unique = true;

    constructor(os) {
        super(os, Steam.name, Steam.id, Steam.icon, "desktop");

        this.container = null;
        this.addedListeners = false;

        this.historyStack = [];
        this.currentIndex = -1;

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
        const response = await fetch(`${getRoot()}html/programs/steam.html`);
        return await response.text();
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }

    getButtons() {
        return this.strings;
    }
}