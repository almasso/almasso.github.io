import Program from "../program.js";

export default class Arkanoid extends Program {

    static icon = "arkanoid.png";
    static id = "arkanoid";
    static name = "Arkanoid";

    constructor(os) {
        super(os, Arkanoid.name, Arkanoid.id, Arkanoid.icon, "desktop", true);
    }

    async getBodyHTML() {
        return `<div>¡Hola!</div>` 
    }

    static getIcons() {
        return [{route : "desktop", isAlias : true}]
    }
}