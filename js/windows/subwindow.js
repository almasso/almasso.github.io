import Window from "./window";

export default class Subwindow extends Window {
    constructor(os, program, id, width = 400, height = 300, maxWidth = 800, maxHeight = 600) {
        super(os, program, id, width, height, maxWidth, maxHeight);
    }
}