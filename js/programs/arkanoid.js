import Program from "../program.js";

export default class Arkanoid extends Program {
    constructor() {
        super("Arkanoid", "arkanoid", "arkanoid.png", true, "desktop");
    }

    getBodyHTML() {
        return `<div>¡Hola!</div>` 
    }
}