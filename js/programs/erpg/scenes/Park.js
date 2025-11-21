import FatherScene from './FatherScene.js';
import {allyParty} from '../fight/Party.js'
import { interactuableObj } from '../obj/enviromentObj.js';
// Escena de exploración (temporal de momento)
export default class ParkScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('park');
	}

	// inicializamos la escena
	create() {
		const config = {
			mute: false,
			volume: 0.5,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0,
		};
		this.musica = this.sound.add('park', config);
		this.musica.play();
		super.create();
		this.eObjs[5].setVisible(false);
		this.eObjs[6].setVisible(false);
		for(let i=0;i<this.sceneChangerCoords.length;i++)this.sceneChangerCoords[i].setVisible(false)

		let self = this;
		this.iFunctions = [];

		this.manin.x=100;
		this.manin.y=100;
		// Recoger la caña de pescar
		this.iFunctions.push(function(){
			let fishingRod = allyParty.questLog.GetQuest('fishingRod');
			if(fishingRod !== undefined && fishingRod.quest.stage === 0 && !fishingRod.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('fishingRod'); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[1].Hide(false);
				self.interactuableObjects[0].trigger.destroy();
				self.interactuableObjects[0].destroy();
			}
		});
		
		// Observar el lago 
		this.iFunctions.push(function(){
			let fishingRod = allyParty.questLog.GetQuest('fishingRod');
			if(fishingRod !== undefined && fishingRod.quest.stage === 1 && !fishingRod.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('fishingRod', true); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[2].Hide(false);
				self.scene.sleep('park');
				self.scene.sleep('hud');
				self.changeCol[1].emit("overlapstart");
				self.interactuableObjects[1].trigger.destroy(); 
				self.interactuableObjects[1].destroy();
			} 
		});

		// Pelea con la estatua
		this.iFunctions.push(function(){
			let fishingRod = allyParty.questLog.GetQuest('fishingRod');
			if(fishingRod !== undefined && fishingRod.quest.stage === 2 && !fishingRod.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('fishingRod'); 
				self.scene.sleep('hud');
				self.interactuableObjects[3].Hide(false);
				self.scene.sleep('park');
				self.musica.stop();
				self.scene.launch('fightscene', {loadFromEnviroment: true, index: 0})
				self.scene.get('fightscene').LoadInventory(allyParty.inventory);
				self.interactuableObjects[2].trigger.destroy();
				self.interactuableObjects[2].destroy();
			}
		});
		
		// Coger item
		this.iFunctions.push(function(){
			let statueQuest = allyParty.questLog.GetQuest('statueQuest');
			if(statueQuest !== undefined && !statueQuest.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('statueQuest'); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[3].trigger.destroy();	
				self.interactuableObjects[3].destroy();
			}
		})
		
		this.iFunctions.push(function(){
			let guitarQuest = allyParty.questLog.GetQuest('guitarQuest');
			if(guitarQuest !== undefined && !guitarQuest.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('guitarQuest'); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[4].trigger.destroy();
				self.interactuableObjects[4].destroy();
			}
		});
		super.generateIObjects(this.iFunctions);

		this.interactuableObjects[1].Hide(true);
		this.interactuableObjects[2].Hide(true);
		this.interactuableObjects[3].Hide(true);

		this.qFunctions = [];

		this.qFunctions.push(function(){ //Caña de pescar
			// Hacer algo al terminar la misión caña de pescar
		})

		
		this.qFunctions.push(function(){ //Melendi
			self.npcs[10].trigger.setScale(1);
			self.npcs[13].trigger.destroy();
			self.npcs[13].destroy();
		})

		this.qFunctions.push(function(){ //Jarfaiter
			self.npcs[11].trigger.setScale(1);
			self.npcs[14].trigger.destroy();
			self.npcs[14].destroy();
		});

		super.generateQuests(this.qFunctions);
		this.interactuableObjects[2].setFlip(true,false)
	}

	// comprobación de colisiones y apertura de menús
	update(){
		super.update();
	}
}