export default class InitialScene extends Phaser.Scene {
	
	constructor() {
		super({ key: 'initial' });
	}
	
	// incializamos la escena	
	create() {
		// fondo
        this.bg = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'initialBg');
		const introconfig = {
			mute: false,
			volume: 0.5,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0,
		};
		this.musica = this.sound.add('intro', introconfig);
		this.musica.play();
		const buttonconfig = {
			mute: false,
			volume: 0.5,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
			delay: 0,
		};
		this.buttonSound = this.sound.add('startbutton', buttonconfig);
        this.bg.scale = 4.71;

		// botón de inicio
        this.startButton = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'startButton').setOrigin(0, 0);
        this.startButton.scale = 4.7;
        this.startButton.x -= this.startButton.displayWidth / 2;
        this.startButton.y -= this.startButton.displayHeight * 2/ 5 + 10;

        this.startButton.setInteractive();
        this.startButton.on('pointerup',()=>{

			this.musica.stop();
			this.buttonSound.play()
			// DAVID PRUEBAS C:
			this.scene.launch('EnvManager');
			/*
			this.scene.launch('park');
			this.scene.sleep('park');
			this.scene.launch('port');
			this.scene.sleep('port');
			this.scene.launch('cementery');
			this.scene.sleep('cementery');
			
			this.scene.launch('square');
			this.scene.get('hud').Walk();
			*/
            this.scene.stop('initial');

		})
    }
}