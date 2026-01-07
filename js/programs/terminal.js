import Program from "../program.js";
import {getRoot} from "../utils.js";
import Car from "./terminalgames/car.js";
import Tunnel from "./terminalgames/tunnel.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";

export default class Terminal extends Program {
    #pendingInput = null;
    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);

        this.container = null;
        this.output = null; 
        this.input = null;
        this.changeLang();

        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
        };
    }

    async #showAboutInfo() {
        if(!Terminal.#info) {
            Terminal.#info = WindowManager.getInstance().createWindow(Subwindow, this, this.instanceData.width, 130, this.instanceData.width, 130, 
                {name: LocalizationManager.getInstance().getStringsFromId("terminal").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/terminal/about.html`});
            Terminal.#info = await Terminal.#info;
            this.changeLang();
        } 
    }

    changeLang() {
        this.commands = {
            help : LocalizationManager.getInstance().getStringsFromId("terminal")["texts"]["cmdhelp"],
            echo: (args) => args.join(" "),
            clear: () => {
                this.output.innerHTML = "";
                return null;
            },
            car: async (args) => {
                if (args.length > 0 && (args[0] === '-version' || args[0] === '-v')) {
                    return `Car Game v${Car.VERSION}`;
                }
                const game = new Car(this);
                await game.start(); 
                return null;
            },
            tunnel : async (args) => {
                if (args.length > 0 && (args[0] === '-version' || args[0] === '-v')) {
                    return `Tunnel Game v${Car.VERSION}`;
                }
                const game = new Tunnel(this);
                await game.start();
                return null;
            }
        }

        if(Terminal.#info) {
            Terminal.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("terminal").buttons.help.options[0].text);
            Terminal.#info.win.querySelector("#shell-text").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("terminal").buttons.help.options[0].info}</p>
            `;
        }
    }

    #scrollToBottom() {
        const scroll = (el) => {
            if (el) el.scrollTop = el.scrollHeight;
        };

        scroll(this.output);
        scroll(this.container);

        requestAnimationFrame(() => {
            scroll(this.output);
            scroll(this.container);
        });
    }

    togglePrompt(visible) {
        if (this.input && this.input.parentElement) {
            const prompt = this.input.parentElement.querySelector('.prompt');
            if (prompt) {
                prompt.style.display = visible ? 'inline' : 'none';
            }
        }
    }

    #processText(text) {
        let processed = text.replace(/\n/g, '<br>');
        processed = processed.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        return `<div>${processed}</div>`;
    }

    #write(text, color = '#00FF00') {
        if (!this.output) {
            console.error("Terminal output element not initialized.");
            return;
        }

        const processedText = this.#processText(text);

        const lastChild = this.output.lastElementChild;
        let lineElement;
        
        if (lastChild && lastChild.tagName === 'DIV' && !lastChild.classList.contains('input-prompt')) {
            lineElement = lastChild;
        } else {
            lineElement = document.createElement('div');
            this.output.appendChild(lineElement);
        }

        const span = document.createElement('span');
        span.innerHTML = processedText;
        span.style.color = color;

        lineElement.appendChild(span);
        
        this.#scrollToBottom(); 
        return lineElement;
    }

    writeLine(text, color = '#00FF00') {
        if (!this.output) {
            console.error("Terminal output element not initialized.");
            return;
        }

        this.#write(text, color);
        
        if (this.output.lastElementChild && this.output.lastElementChild.innerHTML !== '') {
            this.output.appendChild(document.createElement('div'));
        }
        this.#scrollToBottom();
    }

    readLine(promptText, color = '#00FF00') {
        if (this.#pendingInput) {
            this.writeLine("ERROR: Another readLine operation is already pending.", "red");
            return Promise.resolve("");
        }

        this.#write(promptText, color);
        
        this.togglePrompt(false);
        
        this.#scrollToBottom();

        return new Promise(resolve => {
            this.#pendingInput = resolve;
            this.input.focus();
            this.#scrollToBottom();
        });
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/terminal/terminal.html`);
        return await response.text();
    }

    gainedFocus() {
        requestAnimationFrame(() => {
            if(this.container === null) {
                const win = document.getElementById(this.instanceID);
                const container = win.querySelector("#terminal");
                const output = win.querySelector("#terminal-output");
                const input = win.querySelector("#terminal-input");

                const inputParent = input.parentElement;
                if (inputParent && !inputParent.querySelector('.prompt')) {
                    const promptSpan = document.createElement('span');
                    promptSpan.className = 'prompt';
                    promptSpan.textContent = 'almasso@macintosh > ';
                    inputParent.prepend(promptSpan);
                }

                container.id += `-${this.instanceID}`;
                output.id += `-${this.instanceID}`;
                input.id += `-${this.instanceID}`;

                this.container = container;
                this.output = output;
                this.input = input;

                this.input.focus();

                this.container.addEventListener("click", () => {
                    this.input.focus();
                });

                this.input.addEventListener("keypress", e => {
                    if(e.key === "Enter") e.preventDefault();
                });
            }

            if(this.input && this._keydownListener) {
                this.input.removeEventListener("keydown", this._keydownListener);
            }

            this._keydownListener = async (e) => {
                if(e.key === "Enter") {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    let commandLine = this.input.innerText.trim();

                    if(this.#pendingInput) {
                        const resolve = this.#pendingInput;
                        this.#pendingInput = null;
                        
                        const lastLine = this.output.lastElementChild;
                        if (lastLine) {
                            const inputSpan = document.createElement('span');
                            inputSpan.textContent = commandLine;
                            lastLine.appendChild(inputSpan);
                        }
                        
                        this.togglePrompt(true);

                        this.input.innerText = "";
                        this.input.innerHTML = "";
                        setTimeout(() => this.input.focus(), 0);
                        
                        this.#scrollToBottom();
                        resolve(commandLine);
                        return;
                    }

                    if(commandLine) {
                        const commandDiv = document.createElement('div');
                        commandDiv.innerHTML = `<span class="prompt">almasso@macintosh ></span> ${commandLine}`;
                        this.output.appendChild(commandDiv);
                        
                        this.#scrollToBottom();

                        this.input.innerText = "";
                        this.input.innerHTML = "";

                        let [cmd, ...args] = commandLine.split(" ");
                        
                        let commandFunc = this.commands[cmd];
                        let result;

                        if (typeof commandFunc === "function") {
                            result = await commandFunc(args); 
                        } else if (commandFunc !== undefined) {
                            result = commandFunc;
                        } else {
                            result = `${LocalizationManager.getInstance().getStringsFromId("terminal")["texts"]["cmdcommandnf"]}${cmd}`;
                        }

                        if(result !== null && result !== undefined) {
                            this.writeLine(result);
                        }

                        setTimeout(() => this.input.focus(), 0);
                    }
                    else {
                        const commandDiv = document.createElement('div');
                        commandDiv.innerHTML = `<span class="prompt">almasso@macintosh ></span>`;
                        this.output.appendChild(commandDiv);
                        setTimeout(() => this.input.focus(), 0);
                        this.#scrollToBottom();
                    }
                }

                if(e.key === "Backspace") {
                    requestAnimationFrame(() => {
                        if(this.input.innerText === "\n") {
                            this.input.innerHTML = "";
                        }
                    })
                }
            };

            this.input.addEventListener("keydown", this._keydownListener);
        });
    }

    lostFocus() {
        if(this.input && this._keydownListener) {
            this.input.removeEventListener("keydown", this._keydownListener);
            this._keydownListener = null;
        }
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Terminal.#info) Terminal.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }

    async onClose() {
        this.closeSubwindow(Terminal.#info);
    }

}