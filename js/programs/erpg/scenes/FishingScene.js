import FatherScene from './FatherScene.js';
import HUDScene from './HUDScene.js';
// Escena de exploración (temporal de momento)
export default class FishingScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('cinematic2');
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
        
       this.npcs[0].setFlip(true,false)
        this.npcs[0].setScale(5,5);
        this.manin.x=600;
        this.manin.y=450;
        this.manin.destroy()
        
        
		this.count=0;
        this.npcs[0].setFlip(true,false)
        this.scene.sleep('hud')
	}
    update(t,dt)
    {
		if(this.npcs[0].y < 250)
		{
			this.npcs[0].y+=1;
			this.npcs[0].x-=0.5;
		}
		else
		{
			this.count += dt;
			if(this.count > 1500){
				this.scene.wake('hud')
				this.changeCol[0].emit("overlapstart");
				this.scene.stop('cinematic2')
			}
		}

        
       
    }
}