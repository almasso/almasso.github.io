import NPC from "./npc.js";
import { allyParty } from "../fight/Party.js";

export default class healerNPC extends NPC{
    constructor(scene, x, y, imageID, npcID, dialogues, manin){
        super(scene, x, y, imageID, npcID, dialogues, manin);
        this.scene = scene;
    }

    heal(){
        allyParty.party.forEach(function(ally){
            ally.actualHp = ally.maxHp;
            ally.actualMp = ally.maxMp;
            ally.dead = false;
            ally.alteredStates = [false, false, false];
        })
        this.scene.scene.get('hud').UpdateHUD();
    }

    readDialogues(){
        this.heal();
        super.readDialogues();
    }
}