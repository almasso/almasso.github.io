// Original code in C#, translated into JS

import {clamp, rndNext, formatString} from "../../utils.js";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default class Car {
    TOPE = 40;
    ANCHO = 9;

    static VERSION = "1.0 (JS port) - Alejandro Massó Martínez & Raúl Pérez Cogoulludo - 2021";

    constructor(terminal) {
        this.terminal = terminal;
        this.strings = this.terminal.gameStrings["car"];

        this.delta = 0;
        this.pistaIzq = 0;
        this.posCoche = 0;
        this.tamano = 0;
        this.pts = 0;

        this.colIzda = false;
        this.colDcha = false;
        this.stop = false;
        this.dificultad = false;

        this.currentInput = ' ';
        this.inputHandler = this.#handleInput.bind(this);
    }

    async start() {
        await this.#instrucciones();
        await this.#pideDelta(200, 1000);
        this.#inicializa();
        await sleep(this.delta);
        this.#bindInput();

        this.terminal.togglePrompt(false);

        try {
            while (!this.colIzda && !this.colDcha && !this.stop) {
                let inputChar = this.#leeInput(); 
                
                this.#pararJuego(inputChar);
                this.#mueveCoche(inputChar);

                this.#muevePista();

                if (this.dificultad) {
                    this.#anchoPista();
                }

                this.#colision();

                this.#puntuacion();

                this.#renderiza();

                await sleep(this.delta);
                this.#decrementoRetardo();
            }
        } finally {
            this.#unbindInput();
            this.terminal.togglePrompt(true);
        }
        return "Game Over";
    }

    async #instrucciones() {
        this.dificultad = false;
        this.terminal.writeLine(this.strings["instructions"], 'yellow');

        let modoValido = false;
        while (!modoValido) {
            const modo = (await this.terminal.readLine(this.strings["difficulty"], 'white')).toLowerCase();

            if (modo === "n") {
                this.dificultad = false;
                modoValido = true;
            } else if (modo === "d") {
                this.dificultad = true;
                modoValido = true;
            }
        }
    }

    async #pideDelta(min, max) {
        let delta = 0;
        while (delta < min || delta > max || isNaN(delta)) {
            const input = await this.terminal.readLine(formatString(this.strings["refresh"], {min : min, max : max}), 'white');
            delta = parseInt(input);
        }
        this.delta = delta;
    }

    #inicializa() {
        this.pistaIzq = clamp(Math.floor(Math.random() * 100), 0, (this.TOPE - 1 - (this.ANCHO / 2)));
        
        this.posCoche = this.pistaIzq + 1 + Math.floor(this.ANCHO / 2);
        this.tamano = this.ANCHO;
        
        this.terminal.writeLine("GO!!!");

        this.#renderiza();

        this.colIzda = false;
        this.colDcha = false;
        this.stop = false;
    }

    #leeInput() {
        let input = ' ';
        const dir = this.currentInput;

        if (dir === "a") input = 'l';
        else if (dir === "d") input = 'r';
        else if (dir === "q") input = 'q';
        this.currentInput = ''; 
        return input;
    }

    #mueveCoche(c) {
        if (c === 'l') this.posCoche--;
        else if (c === 'r') this.posCoche++;
    }

    #pararJuego(c) {
        if (c === 'q') this.stop = true;
    }

    #muevePista() {
        const variacion = rndNext(-1, 2); 
        
        this.pistaIzq = clamp(this.pistaIzq + rndNext(-1, 2), 0, this.TOPE); 
    }

    #anchoPista() {
        this.tamano = clamp(this.tamano + rndNext(-1, 2), 6, this.ANCHO + 1);
    }

    #colision() {
        if (this.posCoche < (this.pistaIzq + 2)) {
            this.colIzda = true;
        } else if (this.posCoche > (this.pistaIzq + this.tamano - 1)) { 
            this.colDcha = true;
        }
    }

    #puntuacion() {
        if (this.dificultad) this.pts += 15;
        else this.pts += 5;
    }

    #decrementoRetardo() {
        if (this.delta >= 200) {
            this.delta -= 5;
        }
    }

    #renderiza() {
        let lineHTML = "";

        if (!this.colIzda && !this.colDcha && !this.stop) {
            lineHTML += "&nbsp;".repeat(Math.max(0, this.pistaIzq - 1));
            
            lineHTML += "|";

            let numPuntosIniciales = this.posCoche - this.pistaIzq - 2;
            if (numPuntosIniciales > (this.tamano - 2)) numPuntosIniciales = (this.tamano - 2);
            lineHTML += "·".repeat(Math.max(0, numPuntosIniciales));

            lineHTML += `<span style="color: cyan">&lt;o&gt;</span>`;

            let numPuntosFinales = this.pistaIzq + this.tamano - (this.posCoche + 1);
            if (numPuntosFinales > (this.tamano - 2)) numPuntosFinales = (this.tamano - 2);
            lineHTML += "·".repeat(Math.max(0, numPuntosFinales));

            lineHTML += "|";

            this.terminal.writeLine(lineHTML, '#FFFFFF');
        } 
        else if (this.colIzda && !this.stop) {
            lineHTML += "&nbsp;".repeat(Math.max(0, this.pistaIzq - 1));
            
            lineHTML += `<span style="color: red">*o&gt;</span>`;

            let numPuntosFinales = this.pistaIzq + this.tamano - (this.posCoche + 1);
            if (numPuntosFinales > (this.tamano - 2)) numPuntosFinales = (this.tamano - 2);
            lineHTML += "·".repeat(Math.max(0, numPuntosFinales));

            lineHTML += "|";

            this.terminal.writeLine(lineHTML, 'white');
            this.terminal.writeLine(formatString(this.strings["crash"], {tamano : this.tamano}), 'darkred');
            this.terminal.writeLine(formatString(this.strings["points"], {points : this.pts}), 'darkred');
        }
        else if (this.colDcha && !this.stop) {
            lineHTML += "&nbsp;".repeat(Math.max(0, this.pistaIzq - 1));
            lineHTML += "|";

            let numPuntosIniciales = this.posCoche - this.pistaIzq - 2;
            if (numPuntosIniciales > (this.tamano - 2)) numPuntosIniciales = (this.tamano - 2);
            lineHTML += "·".repeat(Math.max(0, numPuntosIniciales));

            lineHTML += `<span style="color: red">&lt;o*</span>`;

            this.terminal.writeLine(lineHTML, 'white');
            this.terminal.writeLine(formatString(this.strings["crash"], {tamano : this.tamano}), 'darkred');
            this.terminal.writeLine(formatString(this.strings["points"], {points : this.pts}), 'darkred');
        }
        else if (this.stop) {
            this.terminal.writeLine(formatString(this.strings["pause"], {tamano : this.tamano}));
            this.terminal.writeLine(formatString(this.strings["points"], {points : this.pts}));
        }
    }

    #handleInput(e) {
        e.preventDefault();
        if (['a', 'd', 'q'].includes(e.key.toLowerCase())) {
            this.currentInput = e.key.toLowerCase();
        }
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