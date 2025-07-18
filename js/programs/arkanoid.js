import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Arkanoid extends Program {

    static icon = "arkanoid.png";
    static id = "arkanoid";
    static name = "Arkanoid";
    static unique = true;
    static width = 815;
    static height = 635;

    constructor(os) {
        super(os, Arkanoid.name, Arkanoid.id, Arkanoid.icon, "desktop");
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/arkanoid.html" style="width:100%; height:100%; border:none;"></iframe>`
    }

    static getIcons() {
        return [{route : "desktop", isAlias : true}]
    }
}