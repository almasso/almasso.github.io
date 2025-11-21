import {allyParty} from '../fight/Party.js'

export default class FinalScene extends Phaser.Scene {
	
	constructor() {
		super({ key: 'final' });
	}

	// inicializamos la escena
	create() {
		// fondo
        this.bg = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'finalBg');
        this.bg.scale = 4.71;

		// botón de reinicio
        this.restartButton = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'retryButton').setOrigin(0, 0);
        this.restartButton.scale = 4.7;
        this.restartButton.x -= this.restartButton.displayWidth / 2;
        this.restartButton.y -= this.restartButton.displayHeight * 2/ 5 - 2;

        this.restartButton.setInteractive();

        this.restartButton.on('pointerup',()=>{
			allyParty.RestartParty();
            this.scene.stop('park');
            this.scene.stop('cementery');
            this.scene.stop('port');
            this.scene.stop('square');
            this.scene.stop('EnvManager');
            this.scene.stop('cinematic1');
            this.scene.stop('fightscene');
            this.scene.stop('hud');
			this.scene.launch('initial');
            this.scene.stop('final');
		})
    }
}