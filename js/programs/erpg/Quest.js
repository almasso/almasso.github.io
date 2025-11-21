import NPC from './obj/npc.js'
import { allyParty } from './fight/Party.js';
import { AllyTEST } from './obj/manin.js';

export class QuestNPC extends NPC {
    constructor(scene, x, y, imageID, qNPCID, npcID, npc_dialogues, quest_dialogues, manin, quest) {
        super(scene, x, y, imageID, npcID, npc_dialogues, manin);
        this.quest = quest;
        this.qNPCID = qNPCID;
        this.questDialogues = quest_dialogues;
        this.countQuestDialogues(this.qNPCID, this.questDialogues);
        this.endDialog = false;
    }

    activateQuest(){
        this.readDialogues();
        this.scene.events.on('dialogWindowClosed', () => {
            this.endDialog = true;
        });

        if(!this.quest.acquired && this.endDialog){
            allyParty.questLog.addQuest(this.quest);
            allyParty.questLog.actualQuest = allyParty.questLog.numQuests - 1; 
            this.scene.scene.get('hud').addQuest(this.quest);
            this.scene.scene.get('hud').UpdateHUD();
            this.quest.acquired = true;   
        }
    }

    readDialogues() {
        this.questDialog(this.qNPCID, this.questDialogues);
    }
    
    advanceQuest(){
        this.quest.advanceQuest();
        //this.manin.questLog.CompleteQuest(this.quest.id);
        allyParty.questLog.actualQuest = allyParty.questLog.GetQuest(this.quest.id).index; 
        if(this.quest.finished){
            allyParty.questLog.CompleteQuest(this.quest.id);
        }
        this.scene.scene.get('hud').UpdateHUD();
        if(this.quest.finished){
            this.quest.function();
        }
    }
}

// this should be mostly HUD but also some management
export class QuestLog {
    constructor(){
        this.quests = [];
        this.completedQuests = [];
        this.noQuests = "No hay mision actual";
        this.numQuests = 0;
        this.numCompletedQuests = 0;
        this.actualQuest = -1;
    }

    addQuest(quest){
        this.quests.push(quest);
        this.numQuests++;
        this.actualQuest = this.numQuests - 1; 
        // añadir todos los textos y eso
    }

    advanceQuest(id, bool = false){  // En caso de lanzarse con booleano a true, se necesita lanzar evento de actualizar el questHud
        let quest = this.GetQuest(id);
        this.actualQuest = quest.index;
        if(bool){
            quest.quest.advanceQuest();
            //this.manin.questLog.CompleteQuest(this.quest.id);
            allyParty.questLog.actualQuest = allyParty.questLog.GetQuest(quest.quest.id).index; 
            if(quest.quest.finished){
                allyParty.questLog.CompleteQuest(quest.quest.id);
                quest.quest.function();
            }
        }
        else{
            quest.quest.actualObjectiveCompleted = true;
        }
    }
    
    CompleteQuest(id){
        this.numCompletedQuests++;
        this.numQuests--;
        let quest = this.GetQuest(id);
        this.quests.splice(quest.index, 1);
        this.completedQuests[this.numCompletedQuests - 1] = quest.quest;
        if(this.actualQuest === quest.index){
            this.actualQuest = 0;
            if(this.quests[this.actualQuest] === undefined) {
                this.actualQuest = -1;
            }
        }
    }


    ShowQuest(){
        if(this.actualQuest !== -1){
            return {name: this.quests[this.actualQuest].name,
                text: this.quests[this.actualQuest].objectives[this.quests[this.actualQuest].stage], 
                yellowColor: this.quests[this.actualQuest].actualObjectiveCompleted};
        }
        else{
            return {text: this.noQuests, yellowColor: false};
        }
    }

    GetQuest(id){
        for(let i = 0; i < this.quests.length; i++){
            if(this.quests[i].id == id){
                return {quest: this.quests[i], index: i};
            }
        }
    }
}

export class Quest {
    constructor(stages, id, name, objectives, npcName, imgID, desc, execute){
        this.stages = stages;
        this.stage = 0;
        this.id = id;
        this.name = name;
        this.objectives = objectives;
        this.actualObjectiveCompleted = false;
        this.finished = false;
        this.acquired = false;
        this.img = imgID;
        this.npcName = npcName;
        this.description = desc;
        this.function = execute;
    }

    advanceQuest(){
        if(!this.finished){
            this.stage++;
            if(this.stage >= this.stages) this.finished = true;
            this.actualObjectiveCompleted = false;
        }
    }
}