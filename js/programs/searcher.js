import Program from "../program.js";

export default class Searcher extends Program {

    static icon = "searcher.png";
    static id = "searcher";
    static name = "Searcher";
    static unique = false;
    static appClass = "program";

    constructor(os) {
        super(os, Searcher.name, Searcher.id, Searcher.icon, "desktop");
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
        return `<div>¡Adiós!</div>`
    }

    getButtons() {
        return this.strings;
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}]
    }
}