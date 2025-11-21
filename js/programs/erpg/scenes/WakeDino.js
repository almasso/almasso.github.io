import FatherScene from './FatherScene.js';
import HUDScene from './HUDScene.js';
import { allyParty } from '../fight/Party.js';

// Escena de exploración (temporal de momento)
export default class DinoWakeScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('cinematic3');
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
		this.musica = this.sound.add('cinematic1', config);
		this.musica.play();
		super.create();
        
        this.npcs[0].setScale(5,5);
        this.manin.x=600;
        this.manin.y=450;
        this.manin.destroy()
        
        this.scene.sleep('hud')
		this.anims.create({
			
			key: 'wake', //identificador de la animación
			frames: this.anims.generateFrameNumbers('dino_wake',  // cambiar animaciones cuando esten hechas
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:11 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 0
		});
		this.count = 0;
		this.npcs[0].on('animationcomplete', end =>{ //evento que se ejecuta cuando una animación ha terminado
			
			this.changeCol[0].emit('overlapstart');
			this.scene.launch('fightscene', {loadFromEnviroment: true, index: 0})
			this.scene.get('fightscene').LoadInventory(allyParty.inventory);
		});

		this.started = false;
	}
    update(t,dt)
    {
		if(!this.started){
			this.count += dt;	
			if(this.count > 4000)
			{
				this.started =true;
				this.npcs[0].play('wake');
			}
		}
    }
}