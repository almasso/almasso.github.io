import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Arkanoid extends Program {

    constructor(processId, instanceData) {
        super(processId, instanceData);
    }

    async getBodyHTML() {
        return `<iframe src="${getRoot()}html/programs/arkanoid.html" style="width:100%; height:100%; border:none;"></iframe>`
    }
}