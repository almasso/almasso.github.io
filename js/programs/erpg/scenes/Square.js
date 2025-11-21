import {allyParty} from '../fight/Party.js'
import FatherScene from './FatherScene.js';
// Escena de exploración (temporal de momento)
export default class Square extends FatherScene {
	// construimos la escena
	constructor() {
		super('square');
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
		this.musica = this.sound.add('square', config);
		this.musica.play();
		super.create();
		this.manin.x=600;
		this.manin.y=150;
		for(let i=0;i<this.eObjs.length;i++)this.eObjs[i].setVisible(false)
		
		for(let i=0;i<this.sceneChangerCoords.length;i++)this.sceneChangerCoords[i].setVisible(false)
		this.qFunctions = [];

		let self = this;
		this.qFunctions.push(function(){
			self.scene.sleep('hud');
			self.scene.sleep('square');
			self.changeCol[3].emit('overlapstart');
		})

		this.qFunctions.push(function(){
			self.npcs[13].trigger.setScale(1);
			self.npcs[15].trigger.destroy();
			self.npcs[15].destroy();
		})
		
		super.generateQuests(this.qFunctions);
		//this.npcs[this.npcs.lengt-1].collider.destroy()
		this.npcs[this.npcs.length-2].setScale(5,5)
		this.npcs[this.npcs.length-2].trigger.setScale(4,4)
	}
	
	// comprobación de colisiones y apertura de menús
	update(){
		super.update();
	}
}