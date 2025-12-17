import {sha256} from "./utils.js"
import ProcessManager from "./processmanager.js";
import WindowManager from "./windows/windowmanager.js";
import Window from "./windows/window.js";

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
        if(metadata.metadata && metadata.metadata.unique) {
            const existing = ProcessManager.getInstance().findProcessByProgramId(metadata.programId);
            if(existing.length > 0) return;
        }
        const process = await ProcessManager.getInstance().createProcess(metadata.programId, metadata);
        if(!process) return;

        const win = process.createWindow();
        if(win) this.processWindow = win;
        else WindowManager.getInstance().focus(this.processWindow);
        
    }

    createWindow() {
        if(!this.processWindow) {
            return WindowManager.getInstance().createWindow(Window, this, this.instanceData.width, this.instanceData.height, this.instanceData.maxWidth, this.instanceData.maxHeight);
        }
        return null;
    }

    async ready() {
        await this._ready;
    }
 
    getButtons() {}

    gainedFocus() {}

    lostFocus() {}

    onClose() {}

    changeLang() {}

    async getBodyHTML() {}
}