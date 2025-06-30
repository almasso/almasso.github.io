import Program from "../program.js";

export default class Searcher extends Program {
    constructor(os) {
        super(os, "Searcher", "searcher", "searcher.png", false, "desktop", false);
        this.addEventListener("localeSet", (e) =>
            this.setLanguage(os.locale, () => {
                const programData = this.searchForProgramInData();
                if(programData) {
                    this.strings = programData["texts"];
                } else {
                    console.warn("No data found for program", this.id);
                    this.strings = {};
                }
            }
        ));
    }

    async getBodyHTML() {
        return `<div>¡Adiós!</div>`
    }

    getButtons() {
        return this.strings;
    }
}