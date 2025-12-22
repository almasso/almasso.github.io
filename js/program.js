import {sha256} from "./utils.js"
import ProcessManager from "./processmanager.js";
import WindowManager from "./windows/windowmanager.js";
import Window from "./windows/window.js";
import LocalizationManager from "./localizationmanager.js";

export default class Program extends EventTarget {
    
    /**
     * 
     * @param {Number} processId Process identifier
     * @param {Object} instanceData Program instance data
     */
    constructor(processId, instanceData) {
        super();
        this.name = instanceData.name;
        this.id = instanceData.programId;
        this.pid = processId;
        this.icon = instanceData.icon;
        this.route = instanceData.route;
        this.instanceData = instanceData;
        this.processWindow = null;
        this.isDragging = false;
        this.zIndexCounter = 2;
        this._ready = sha256(this.id + this.pid.toString()).then((result) => {
            this.instanceID = result;
        });
        this._languageReady = null;
    }

    static async launch(metadata) {
        let existingProcess = null;

        if(metadata.programId === "finder") {
            existingProcess = ProcessManager.getInstance().findProcess(p => p.id === "finder" && p.instanceData.route === metadata.route);
        }
        else if(metadata.metadata && metadata.metadata.unique) {
            const results = ProcessManager.getInstance().findProcessByProgramId(metadata.programId);
            if(results.length > 0) existingProcess = results[0];
        }

        if(existingProcess) {
            const existingWindow = WindowManager.getInstance().findWindowByProcessId(existingProcess.pid);
            if(existingWindow) WindowManager.getInstance().focus(existingWindow);
            return;
        }

        const process = await ProcessManager.getInstance().createProcess(metadata.programId, metadata);
        if(!process) return;

        const win = await process.createWindow();
        if(win) process.processWindow = win;
        else WindowManager.getInstance().focus(process.processWindow);
        
    }

    async createWindow() {
        if(!this.processWindow) {
            return await WindowManager.getInstance().createWindow(Window, this, this.instanceData.width, this.instanceData.height, this.instanceData.maxWidth, this.instanceData.maxHeight);
        }
        return null;
    }

    async ready() {
        await this._ready;
    }
 
    getButtons() {
        return LocalizationManager.getInstance().getStringsFromId(this.id)["buttons"];
    }

    gainedFocus() {}

    lostFocus() {}

    onClose() {}

    changeLang() {}

    async getBodyHTML() {}
}