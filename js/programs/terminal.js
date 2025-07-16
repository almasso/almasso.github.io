import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Terminal extends Program {

    static icon = "terminal.png";
    static id = "terminal";
    static name = "Terminal";
    static unique = false;

    constructor(os) {
        super(os, Terminal.name, Terminal.id, Terminal.icon, "desktop");

        this.container = null;

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

            this.commands = {
                help : this.strings["cmdhelp"],
                echo: (args) => args.join(" "),
                clear: () => {
                    this.output.innerHTML = "";
                    return null;
                }
            }
        } else {
            console.warn("No data found for program", this.id);
            this.strings = {};
        }
        this.os.dispatchEvent(new CustomEvent("langLoaded", {}));
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/terminal.html`);
        return await response.text();
    }

    gainedFocus() {
        requestAnimationFrame(() => {
            if(this.container === null) {
                const win = document.getElementById(this.instanceID);
                const container = win.querySelector("#terminal");
                const output = win.querySelector("#terminal-output");
                const input = win.querySelector("#terminal-input");

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
            }

            this._keydownListener = (e) => {
                if(e.key === "Enter") {
                    e.preventDefault();
                    let commandLine = this.input.innerText.trim();
                    let [cmd, ...args] = commandLine.split(" ");
                    let result = this.commands[cmd]
                    ? typeof this.commands[cmd] === "function"
                    ? this.commands[cmd](args)
                    : this.commands[cmd]
                    : `${this.strings["cmdcommandnf"]}${cmd}`;

                    if(result !== null) {
                        this.output.innerHTML += `
                            <div>
                                <span class="prompt">user@terminal ></span> ${commandLine}
                            </div>
                            <div>
                                ${result}
                            </div>
                        `;
                        this.output.scrollTop = this.output.scrollHeight;
                    }

                    this.input.innerText = "";
                    this.input.innerHTML = "";
                    setTimeout(() => this.input.focus(), 0);
                    //this.container.scrollTop = this.container.scrollHeight;
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
            this.input.addEventListener("keypress", e => {
                if(e.key === "Enter") e.preventDefault();
            });
        });
    }

    lostFocus() {
        if(this.input && this._keydownListener) {
            this.input.removeEventListener("keydown", this._keydownListener);
            this._keydownListener = null;
        }
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }
}