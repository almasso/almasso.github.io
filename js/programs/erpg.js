import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class ERPG extends Program {

    static icon = "erpg.png";
    static id = "erpg";
    static name = "ÑRPG";
    static unique = true;
    static width = 800;
    static height = 620;
    static appClass = "webgame";
    static src = `${getRoot()}html/programs/erpg/erpg.html`;
    static urlpage = "http://www.erpg.manininteractive.com";

    constructor(os) {
        super(os, ERPG.name, ERPG.id, ERPG.icon, "desktop");
        this.addEventListener("localeSet", (e) => {
            this.setLanguage(os.locale);
            this.getProgramData();
        });
    }
    
    static getIcons() {
        return [{route : "desktop", isAlias : true}]
    }
}