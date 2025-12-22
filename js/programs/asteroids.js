import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Asteroids extends Program {

    constructor(processId, instanceData) {
        super(processId, instanceData);
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/asteroids.html" style="width:100%; height:100%; border:none;"></iframe>`
    }
}