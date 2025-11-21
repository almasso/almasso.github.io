import { EnviromentInfo } from '../fight/EnviromentInfo.js';
import FatherScene from './FatherScene.js';
import HUDScene from './HUDScene.js';
// Escena de exploración (temporal de momento)
export default class FirstScene extends FatherScene {
	// construimos la escena
	constructor() {
		super('cinematic1');
	}

	// inicializamos la escena
	create() {
        this.count = 0;
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
        
        this.npcs[1].setScale(5,5);
        this.npcs[1].setVisible(false);
		this.count=0;
        this.npcs[3].setFlip(true,false)
        this.scene.sleep('hud')
	}
    update(t,dt)
    {
        this.count += dt;
        if(this.count < 20000 && this.spaceKey.isDown) this.count=20000;
        if(this.count > 20500&&this.spaceKey.isDown)this.count=28000
        if(this.count < 23000&&this.count > 20000)
        {
            
            this.eObjs[1].setVisible(false);
            if(this.npcs[2].x<500)this.npcs[2].x+=1;
            if(this.npcs[3].x>725)this.npcs[3].x-=1;
            if(this.npcs[4].y>475)this.npcs[4].y-=1;
            
            
        }
        else if(this.count>24000 && this.count<28000)
        {
            this.npcs[1].setVisible(true);
            this.npcs[0].setVisible(false);
            this.npcs[2].setFlip(true,false)
            this.npcs[2].x-=1;
            this.npcs[2].y+=1;
            if(this.npcs[3].x>600)this.npcs[3].x-=1;
            this.npcs[3].y-=1;
            this.npcs[4].x+=1.5;
            this.npcs[4].y+=1;

        }
        else if(this.count>28000){
            this.scene.wake('hud')
            this.changeCol[0].emit("overlapstart");
            this.scene.stop('cinematic1')
        }
       
    }
}