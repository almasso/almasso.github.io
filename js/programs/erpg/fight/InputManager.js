// gestión de INPUT para la FightScene
export class InputMan extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,-100,-100,'pixel1x1');
        
		this.wKey = this.scene.input.keyboard.addKey('W'); // move up
		this.aKey = this.scene.input.keyboard.addKey('A'); // move left
		this.sKey = this.scene.input.keyboard.addKey('S'); // move down
		this.dKey = this.scene.input.keyboard.addKey('D'); // move right
		this.spaceKey = this.scene.input.keyboard.addKey('SPACE'); // interact
		//···RAUL···
		this.eKey = this.scene.input.keyboard.addKey('E'); //chose
		this.qKey = this.scene.input.keyboard.addKey('Q');  //attack
		this.escKey = this.scene.input.keyboard.addKey("ESC");
		this.scene.add.existing(this); //Añadimos a Manín a la escena
	}
}