// Original code in C#, translated into JS

import {clamp, rndNext, formatString} from "../../utils.js";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default class Tunnel {
    ANCHO = 30;
    ALTO = 15;
    DEBUG = false;

    constructor(terminal) {
        this.terminal = terminal;
        this.strings = this.terminal.gameStrings["tunnel"];

        this.ejecutando = true;
        this.pausa = false;

        this.suelo = new Array(this.ANCHO).fill(0);
        this.techo = new Array(this.ANCHO).fill(0);

        this.naveC = Math.floor(this.ANCHO / 2);
        this.naveF = Math.floor(this.ALTO / 2);
        
        this.balaC = -1; 
        this.balaF = -1;
        
        this.enemigoC = -1; 
        this.enemigoF = -1;
        
        this.colC = -1; 
        this.colF = -1;

        this.puntos = 0;
        this.kills = 0;

        this.currentInput = '';
        this.inputHandler = this.#handleInput.bind(this);
    }

    async start() {
        this.#iniciaTunel();

        this.terminal.togglePrompt(false);
        this.#bindInput();

        try {
            while (this.ejecutando) {
                const ch = this.#leeInput();
                if (ch === 'q') {
                    this.#terminarPartida();
                } else if (ch === 'p') {
                    await this.#pausaJuego();
                } else if (this.ejecutando) {
                    this.#avanzaTunel();
                    this.#generaAvanzaEnemigo();
                    this.#avanzaNave(ch);
                    this.#generaAvanzaBala(ch);
                    const crashNave = this.#colisionNave();
                    this.#colisionBala();
                    this.#render(crashNave);
                    this.puntos++;
                    if (crashNave) {
                        this.#terminarPartida();
                        this.#render(true);
                        await sleep(2000);
                    }
                }

                await sleep(120);
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.#unbindInput();
            this.terminal.togglePrompt(true);
        }
        
        const total = this.puntos + this.kills + 1;
        const msg = formatString(this.strings["total_label"], { total: total });
        this.terminal.writeLine(msg, "magenta");
        return;
    }

    #iniciaTunel() {
        this.techo[this.ANCHO - 1] = 0;
        this.suelo[this.ANCHO - 1] = this.ALTO - 1;

        for (let i = 0; i < this.ANCHO - 1; i++) {
            this.#avanzaTunel();
        }
    }

    #avanzaTunel() {
        for (let i = 0; i < this.ANCHO - 1; i++) {
            this.techo[i] = this.techo[i + 1];
            this.suelo[i] = this.suelo[i + 1];
        }

        let s = this.suelo[this.ANCHO - 1];
        let t = this.techo[this.ANCHO - 1];

        const opt = rndNext(5);
        if (opt === 0 && s < this.ALTO - 1) { s++; t++; }
        else if (opt === 1 && t > 0) { s--; t--; }
        else if (opt === 2 && (s - t) > 7) { s--; t++; }
        else if (opt === 3) {
            if (s < this.ALTO - 1) { s++; }
            if (t > 0) { t--; }
        }

        this.suelo[this.ANCHO - 1] = s;
        this.techo[this.ANCHO - 1] = t;
    }

    #generaAvanzaEnemigo() {
        const prob = rndNext(4);

        if (this.enemigoC === -1 && prob === 2) {
            this.enemigoC = this.ANCHO - 1;
            // Math.Clamp logic
            const minF = this.techo[this.ANCHO - 1] + 1;
            const maxF = this.suelo[this.ANCHO - 1] - 1;
            this.enemigoF = clamp(rndNext(this.ALTO), minF, maxF);
        } else if (this.enemigoC !== -1) {
            this.enemigoC--;
        }
    }

    #avanzaNave(ch) {
        const enPared = (this.naveF >= this.suelo[this.naveC] || this.naveF <= this.techo[this.naveC]);
        const enEnemigo = (this.naveC === this.enemigoC && this.naveF === this.enemigoF);

        if (!enEnemigo && !enPared) {
            if (ch === 'l' && this.naveC > 0) { this.naveC--; }
            else if (ch === 'r' && this.naveC < this.ANCHO - 1) { this.naveC++; }
            else if (ch === 'u') { this.naveF--; }
            else if (ch === 'd') { this.naveF++; }
        }
    }

    #generaAvanzaBala(ch) {
        if (this.balaC === -1 && ch === 'x') {
            this.balaC = this.naveC + 1;
            this.balaF = this.naveF;
        } else if (this.balaC !== -1) {
            const enEnemigo = (this.balaC === this.enemigoC && this.balaF === this.enemigoF);
            let enPared = false;
            if (this.balaC < this.ANCHO) {
                enPared = (this.balaF <= this.techo[this.balaC] || this.balaF >= this.suelo[this.balaC]);
            }

            if (!enEnemigo && !enPared) {
                this.balaC++;
            }
        }
    }

    #colisionNave() {
        if ((this.naveC === this.enemigoC && this.naveF === this.enemigoF) ||
            (this.naveF >= this.suelo[this.naveC] || this.naveF <= this.techo[this.naveC])) {
            return true;
        }
        return false;
    }

    #colisionBala() {
        this.colC = -1;
        this.colF = -1;

        if (this.balaC !== -1) {
            if (this.balaC >= this.ANCHO) {
                this.balaC = -1;
                this.balaF = -1;
            } else if (this.balaC === this.enemigoC && this.balaF === this.enemigoF) {
                this.colC = this.balaC;
                this.colF = this.balaF;
                this.balaC = -1;
                this.balaF = -1;
                this.enemigoC = -1;
                this.kills += 50;
            } else if (this.balaF >= this.suelo[this.balaC]) {
                this.colC = this.balaC;
                this.colF = this.balaF;
                this.suelo[this.balaC] = this.balaF + 1;
                this.balaC = -1;
                this.balaF = -1;
            } else if (this.balaF <= this.techo[this.balaC]) {
                this.colC = this.balaC;
                this.colF = this.balaF;
                this.techo[this.balaC] = this.balaF - 1;
                this.balaC = -1;
                this.balaF = -1;
            }
        }
    }

    #terminarPartida() {
        this.ejecutando = false;
    }

    async #pausaJuego() {
        this.terminal.commands.clear();
        
        const html = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: red;">
                <div>${this.strings["paused"]}</div>
                <div style="color: white; font-size: 0.8em;">${this.strings["continue"]}</div>
            </div>
        `;
        this.terminal.output.innerHTML = html;

        this.currentInput = ''; 
        while(this.currentInput === '') {
            await sleep(100);
        }
        this.currentInput = '';
    }
    
    #render(crashNave) {
        let bufferHTML = "";

        for (let y = 0; y < this.ALTO; y++) {
            let lineHTML = "";
            for (let x = 0; x < this.ANCHO; x++) {
                let char = "&nbsp;&nbsp;";
                let fg = "white";
                let bg = "transparent";

                if (y <= this.techo[x] || y >= this.suelo[x]) {
                    bg = "blue";
                }

                if (x === this.balaC && y === this.balaF) {
                    char = "--";
                    fg = "magenta";
                    bg = "transparent";
                }

                if (x === this.enemigoC && y === this.enemigoF) {
                    char = "&lt;&gt;";
                    fg = "yellow";
                    bg = "transparent";
                }

                if (x === this.naveC && y === this.naveF) {
                    if (crashNave) {
                        char = "**";
                        fg = "red";
                    } else {
                        char = "=&gt;";
                        fg = "lime";
                    }
                    bg = "transparent";
                }

                if (x === this.colC && y === this.colF) {
                    char = "¡!";
                    fg = "red";
                    bg = "transparent";
                }

                if (bg !== "transparent") {
                    lineHTML += `<span style="background-color: ${bg}; color: ${fg}">${char}</span>`;
                } else {
                    lineHTML += `<span style="color: ${fg}">${char}</span>`;
                }
            }
            bufferHTML += `<div>${lineHTML}</div>`;
        }

        const puntosStr = formatString(this.strings["score_label"], { pts: this.puntos });
        const killsStr = formatString(this.strings["kills_label"], { kills: this.kills });
        
        bufferHTML += `<div style="color: lime; margin-top: 10px; border-top: 1px solid gray;">${puntosStr}</div>`;
        bufferHTML += `<div style="color: yellow;">${killsStr}</div>`;

        if (!this.ejecutando) {
             bufferHTML += `<div style="color: magenta; margin-top: 5px; font-weight: bold;">${this.strings["game_over"]}</div>`;
        }

        this.terminal.output.innerHTML = bufferHTML;
        
        this.terminal.output.scrollTop = this.terminal.output.scrollHeight;
    }


    #handleInput(e) {
        e.preventDefault();
        if (this.terminal.input) this.terminal.input.innerText = ""; 

        const key = e.key.toLowerCase();
        
        if (key === 'a' || key === 'arrowleft') this.currentInput = 'l';
        else if (key === 'd' || key === 'arrowright') this.currentInput = 'r';
        else if (key === 'w' || key === 'arrowup') this.currentInput = 'u';
        else if (key === 's' || key === 'arrowdown') this.currentInput = 'd';
        else if (key === ' ' || key === 'x') this.currentInput = 'x';
        else if (key === 'p') this.currentInput = 'p';
        else if (key === 'q' || key === 'escape') this.currentInput = 'q';
        else if (this.currentInput === '') this.currentInput = 'any'; 
    }

    #leeInput() {
        const input = this.currentInput;
        this.currentInput = '';
        return input;
    }

    #bindInput() {
        if (this.terminal.input) {
            this.terminal.input.focus();
            this.terminal.input.addEventListener('keydown', this.inputHandler);
        }
    }

    #unbindInput() {
        if (this.terminal.input) {
            this.terminal.input.removeEventListener('keydown', this.inputHandler);
        }
        this.currentInput = '';
    }
}