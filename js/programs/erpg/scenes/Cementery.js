import FatherScene from './FatherScene.js';
import { allyParty } from '../fight/Party.js';

// Escena de exploración (temporal de momento)
export default class CementeryScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('cementery');
	}

	// inicializamos la escena
	create() {
		const config = {
			mute: false,
			volume: 0.5,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
			delay: 0,
		  };
		this.dreamon = this.sound.add('dreamon', config);
		const windconfig = {
			mute: false,
			volume: 2,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0,
		  };
		this.musica = this.sound.add('wind', windconfig);
		this.musica.play();
		super.create();
		this.npcs[0].setFlip(true,false);
		this.eObjs[0].setVisible(false);
		this.kratos=false;
		this.count=0;
		this.manin.x=750;
		this.manin.y=122;
		for(let i=1;i<this.eObjs.length;i++)
		{
			this.eObjs[i].setVisible(false);
		}
		for(let i=0;i<this.sceneChangerCoords.length;i++)this.sceneChangerCoords[i].setVisible(false)

		
		this.iFunctions = [];
		let self = this;
		// Coger item
		this.iFunctions.push(function(){
			let statueQuest = allyParty.questLog.GetQuest('statueQuest');
			if(statueQuest !== undefined && !statueQuest.quest.actualObjectiveCompleted){
				allyParty.questLog.advanceQuest('statueQuest'); 
				self.scene.get('hud').events.emit("updateQuestHUD");
				self.interactuableObjects[0].trigger.destroy();	
				self.interactuableObjects[0].destroy();
			}
		})

		super.generateIObjects(this.iFunctions);

		this.interactuableObjects[0].setVisible(false);
		this.interactuableObjects[0].trigger.setScale(0);


	}

	// comprobación de colisiones y apertura de menús
	update(t,dt){

		super.update();

		if(this.kratos)
		{
			this.count += dt;
			if(this.count > 1)
			{

				if(this.npcs[0].x!=440)
				{
					this.npcs[0].x-=1;					

					if(this.npcs[0].x==440)
					{
						this.npcs[0].y+=45;
						this.npcs[0].setFlip(false, true);
					}
				}
				else
				{
					this.npcs[0].y+=0.75;	
				}
				this.count = 0;
			}
			if(this.npcs[0].y>=650)
			{
				this.kratos=false;
				this.npcs[0].destroy();
				this.dreamon.stop();
				this.eObjs[0].setVisible(true);
				this.interactuableObjects[0].setVisible(true);
				this.interactuableObjects[0].trigger.setScale(0.7, 0.7);
				this.manin.setActive(true);
			}
		}
	}	

	Kratos()
	{
		this.musica.stop();
		this.dreamon.play();
		this.kratos=true;
		
		this.npcs[0].trigger.destroy();
		this.manin.setActive(false);
	
	}
	
}