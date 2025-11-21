import { allyParty } from '../fight/Party.js';
import FatherScene from './FatherScene.js';
// Escena de exploración (temporal de momento)
export default class PortScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('port');
	}

	// inicializamos la escena
	create() {
		let self = this;
		const config = {
			mute: false,
			volume: 0.5,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0,
		};
		this.musica = this.sound.add('devs', config);
		this.musica.play();

		super.create();

		for(let i=0;i<this.npcs.length;i++)this.npcs[i].setScale(5,5)
		this.manin.x=400
		this.manin.y=500
		this.manin.setScale(5,5)
		for(let i=0;i<this.sceneChangerCoords.length;i++)this.sceneChangerCoords[i].setVisible(false)
		
		this.iFunctions = [];
		
		this.qFunctions = [];
		
		this.qFunctions.push(function(){
			self.npcs[self.npcs.length -1].trigger.destroy();
			self.npcs[self.npcs.length -1].destroy();
			self.npcs[4].trigger.setScale(3);
			self.npcs[4].setVisible(true);
			self.Fight();
		});
		// Coger item
		this.iFunctions.push(function(){
			console.log(self.npcs)
			let statueQuest = allyParty.questLog.GetQuest('statueQuest');
			if(statueQuest !== undefined && !statueQuest.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('statueQuest'); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[0].trigger.destroy();	
				self.interactuableObjects[0].destroy();
			}
		})
		
		super.generateIObjects(this.iFunctions);
		
		super.generateQuests(this.qFunctions);
		
		this.interactuableObjects[0].setScale(0);
		this.interactuableObjects[0].setVisible(false);
		this.npcs[this.npcs.length -1].setScale(5);
		
		this.npcs[4].trigger.setScale(0);
		this.npcs[4].setVisible(false);
	}

	// Pelea con los devs
	Fight()
	{
		this.scene.sleep('hud');
		this.scene.sleep('port');
		this.musica.stop();
		this.scene.launch('fightscene', {loadFromEnviroment: true, index: 0});
		this.scene.get('fightscene').LoadInventory(allyParty.inventory);
		this.interactuableObjects[0].setVisible(true);
		this.interactuableObjects[0].setScale(5);
		this.interactuableObjects[0].trigger.setScale(50);
	}

	// comprobación de colisiones y apertura de menús
	update(){
		super.update();
	}
}