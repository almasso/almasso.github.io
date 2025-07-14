import {sha256} from "./utils.js"

export default class Program extends EventTarget {
    
    static programCount = 0;

    constructor(os, name, id, icon, route) {
        super();
        this.os = os;
        this.name = name;
        this.id = id;
        this.icon = icon;
        this.isDragging = false;
        this.zIndexCounter = 2;
        this.route = route;
        this._ready = sha256(this.id + Program.programCount.toString()).then((result) => {
            this.instanceID = result;
        });

        this._languageReady = null;
        
        Program.programCount++;
    }

    async ready() {
        await this._ready;
    }

    async langReady() {
        await this._languageReady;
    }

    static getIcons() {}
 
    getButtons() {}

    gainedFocus() {}

    lostFocus() {}

    setLanguage(langcode) {
        this._languageReady = fetch(`assets/texts/${langcode}.json`).then(response => {
            if(!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        }).then(data => {
            this.langData = data;
        }).catch(error => {
            console.error("Failed to load JSON: ", error);
            throw error;
        });
    }

    searchForProgramInData() {
        return this.langData?.find(e => e.id === this.id) || null;
    }

    async getBodyHTML() {}
}