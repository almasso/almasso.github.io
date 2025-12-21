export default class WindowManager extends EventTarget {

    static #Instance = null;
    #windows = [];
    #windowId = 0;

    constructor() {
        super();
    }

// #region Singleton instance
    static initInstance() {
        if(!WindowManager.#Instance) WindowManager.#Instance = new WindowManager();
        return;
    }

    static getInstance() {
        if(!WindowManager.#Instance) WindowManager.initInstance();
        return WindowManager.#Instance;
    }
// #endregion

    /**
     * Creates a window of windowType type
     * @param {Class} windowType Window type
     * @param {Program} process Instance of a program (process)
     * @param {Number} width Window width
     * @param {Number} height Window height
     * @param {Number} maxWidth Window maximum width
     * @param {Number} maxHeight Window maximum height
     * @returns Instance of a window
     */
    async createWindow(windowType, process, width, height, maxWidth = 2 * width, maxHeight = 2 * height, extraData = {}) {
        const win = new windowType(process, this.#getNextId(), width, height, maxWidth, maxHeight, extraData);
        await win.open();
        this.#add(win);
        return win;
    }

    /**
     * Adds a window to the manager
     * @param {Window} win Window
     */
    #add(win) {
        this.#windows.push(win);
        this.focus(win);
    }

    /**
     * Removes and closes a window from the manager given the window identifier
     * @param {Number} winId Window identifier
     */
    remove(winId) {
        const win = this.#windows.find(w => w.id === winId);
        if(win) {
            this.#windows = this.#windows.filter(w => w.id !== winId);
            this.dispatchEvent(new CustomEvent("window:closed", {
                detail: {window: win}
            }));
            win.destroy();
        }
    }

    /**
     * Removes and closes window from the manager given the process identifier
     * @param {Number} pid Process identifier
     */
    removeWindowByPID(pid) {
        const win = this.#windows.find(w => w.program.pid === pid);
        if(win) {
            this.#windows = this.#windows.filter(w => w.id !== win.id);
            this.dispatchEvent(new CustomEvent("window:closed", {
                detail: {window: win}
            }));
            win.destroy();
        }
    }

    /**
     * Focus a window while unfocusing the rest
     * @param {Window} win 
     */
    focus(win) {
        this.#windows.forEach(w => w.unfocus());
        if(win) {
            this.dispatchEvent(new CustomEvent("window:focused", {
                detail: {window: win}
            }));
            win.focus();
        }
    }

    /**
     * Unfocus all windows
     */
    unfocusAllWindows() {
        this.focus(null);
    }

    /**
     * Returns the window associated with a determined program identifier
     * @param {String} programId 
     * @returns Window
     */
    findWindowByProgramId(programId) {
        return this.#windows.find(w => w.program.id === programId);
    }

    findWindowByProcessId(pid) {
        return this.#windows.find(w => w.program.pid === pid);
    }

    /**
     * Returns the current window identifier value
     * @returns Window identifier value
     */
    #getNextId() {
        return this.#windowId++;
    }

// #region Event subscription
    subscribeToCloseWindowEvent(fn) {
        this.addEventListener("window:closed", fn);
    }

    subscribeToFocusWindowEvent(fn) {
        this.addEventListener("window:focused", fn);
    }
// #endregion
}