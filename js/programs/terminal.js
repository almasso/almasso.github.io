import Program from "../program.js";

export default class Terminal extends Program {

    static icon = "terminal.png";
    static id = "terminal";
    static name = "Terminal";

    constructor(os) {
        super(os, Terminal.name, Terminal.id, Terminal.icon, "desktop", false);

        this.instanceID = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        this.container = null;

        this.addEventListener("localeSet", (e) =>
            this.setLanguage(os.locale, () => {
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
            }
        ));
    }

    async getBodyHTML() {
        const response = await fetch("./../../../html/programs/terminal.html");
        return await response.text();
    }

    gainedFocus() {
        requestAnimationFrame(() => {
            console.log("cargó", this.container)
            if(this.container === null) {
                const container = document.getElementById("terminal");
                const output = document.getElementById("terminal-output");
                const input = document.getElementById("terminal-input");

                container.id += `-${this.instanceID}`;
                output.id += `-${this.instanceID}`;
                input.id += `-${this.instanceID}`;

                this.container = container;
                this.output = output;
                this.input = input;
            }

            this._keydownListener = (e) => {
                if(e.key === "Enter") {
                    let commandLine = this.input.value.trim();
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
                    }

                    this.input.value = "";
                    this.container.scrollTop = this.container.scrollHeight;
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

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }
}