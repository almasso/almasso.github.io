import { Filesystem } from "./filesystem.js";
import { ClassMap } from "./registry.js";
import LocalizationManager from "./localizationmanager.js";
import WindowManager from "./windows/windowmanager.js";

export default class ProcessManager {
    static #Instance = null;
    #processes = new Map();

    constructor() {
        this.nextPid = 1000;
        LocalizationManager.getInstance().subscribeToLocaleChangeEvent(() => this.#changeProcessLang());
    }

// #region Singleton instance
    static initInstance() {
        if(!ProcessManager.#Instance) ProcessManager.#Instance = new ProcessManager();
        return;
    }

    static getInstance() {
        if(!ProcessManager.#Instance) ProcessManager.initInstance();
        return ProcessManager.#Instance;
    }
// #endregion

    /**
     * Creates a process of a given program
     * @param {String} programIdentifier Program identifier
     * @param {Object} metadata Program metadata to initialize
     */
    async createProcess(programIdentifier, metadata = {}) {
        const registryData = Filesystem.registry[programIdentifier];
        if(!registryData) return null;

        const AppClass = ClassMap[registryData.classRef];
        if(!AppClass) return null;

        const finalMetadata = {...registryData, ...metadata};

        const pid = this.nextPid++;

        const instance = new AppClass(pid, finalMetadata);
        if(instance.ready) await instance.ready();

        this.#processes.set(pid, instance);

        return instance;
    }

    /**
     * Kills a process given its process identifier
     * @param {Number} pid Process identifier
     */
    killProcess(pid) {
        const instance = this.#processes.get(pid);
        if(instance) {
            if(instance.onClose) instance.onClose();
            this.#processes.delete(pid);
            WindowManager.getInstance().removeWindowByPID(pid);
        }
    }

    /**
     * Finds a process given the program ID
     * @param {String} programId Program identifier
     */
    findProcessByProgramId(programId) {
        let pr = []
        for(let instance of this.#processes.values()) {
            if(instance && instance.id === programId) pr.push(instance);
        }
        return pr;
    }

    /**
     * Returns a process given the process identifier
     * @param {Number} pid Process identifier 
     * @returns Process
     */
    getProcess(pid) {
        return this.#processes.get(pid);
    }

    #changeProcessLang() {
        this.#processes.forEach(process => {
            process.changeLang();
        });
    }

    get processes() {
        return this.#processes;
    }
}