import { getFolderContent } from "../filesystem.js";
import Program from "../program.js";
import {getRoot} from "../utils.js";
import Icon from "../icon.js";

export default class Searcher extends Program {
    constructor(processId, instanceData) {
        //const name = instanceData.metadata.path.length > 0 ? instanceData.metadata.path[instanceData.metadata.path.length - 1] : Searcher.name;
        super(processId, instanceData);

        //this.currentPath = path;
        this.viewId = `searcher-view-${this.instanceID}`;

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
        return `
            <div class="searcher-toolbar">
                <div id="path-display">${this.currentPath.length > 0 ? this.currentPath.join(" > ") : "Macintosh HD"}</div>
            </div>
            <div class="searcher-content" id="${this.viewId}">
                </div>
        `;
    }

    onWindowReady(winElement) {
        this.renderIcons();
    }

    renderIcons(){
        const folder = getFolderContent(this.currentPath);

        if(!folder || !folder.children) {
            document.getElementById(this.viewId).innerHTML = "<p style='padding:10px;'>Empty folder</p>";
            return;
        }

        folder.children.forEach(item => {
            if(item.type === "file" || item.type === "systemfile") {
                const appClass = this.os.appRegistered.get(item.appId);
                if(appClass) {
                    new Icon(this.os, appClass, false, this.viewId);
                }
            }
            else if(item.type === "folder") {
                const folderProgram = {
                    id: `folder_${item.name}`,
                    name: item.name,
                    icon: item.icon,
                    appClass: "folder",
                    path: [...this.currentPath, item.name]
                };
                new Icon(this.os, folderProgram, false, this.viewId);
            }
        });
    }

    getButtons() {
        return this.strings;
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}]
    }
}