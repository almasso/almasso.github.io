import NPC from "./npc.js";
import { allyParty } from "../fight/Party.js";
import { QuestNPC } from "../Quest.js";
import { enviromentObj, interactuableObj } from "./enviromentObj.js";
import shopNPC from "./shopNPC.js";

const PROBABILIDAD_COMBATE = 25;

export class AllyTEST extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, manin, info) {
		super(scene, x, y, info.imgID);
        
        this.scene.add.existing(this);
        this.setScale(0.15,0.15);
        scene.physics.add.existing(this, true);
        this.manin = manin;

        this.trigger = this.scene.add.zone(x, y, this.body.width + 7, this.body.height + 7);
        this.generateTrigger();
        this.scene.physics.world.enable(this.trigger);
        this.trigger.body.onOverlap = true;
        this.trigger.setScale(7);
		this.info = info;
		this.isInteracting = false;
	}
	generateTrigger() {
        this.scene.physics.add.collider(this.manin, this);
		this.scene.physics.add.overlap(this.manin, this.trigger);
    }
}

export class Manin extends Phaser.GameObjects.Sprite {

	constructor(scene, x, y, uiScene) {
		super(scene, x, y, 'manin_move');
		this.scene = scene;
		this.speed = 300; // Nuestra velocidad de movimiento será 100
        this.setScale(3,3);
		this.depth = 2;
		this.scene.add.existing(this); //Añadimos a Manín a la escena
		this.zone = this.scene.add.zone(x, y + this.displayHeight / 3).setSize(this.displayWidth / 2,this.displayHeight / 4);
		this.scene.physics.world.enable(this.zone);
        this.stepsWalked = 0;
        this.touchingGrass = false;
		this.random = 100;

		this.touchingFria=false;
		this.moves = [false, false, false, false] // DERECHA, IZQUIERDA, ARRIBA, ABAJO

		this.collider = null;
		this.uiScene = uiScene;
		this.wKey = this.scene.input.keyboard.addKey('W'); // move up
		this.aKey = this.scene.input.keyboard.addKey('A'); // move left
		this.sKey = this.scene.input.keyboard.addKey('S'); // move down
		this.dKey = this.scene.input.keyboard.addKey('D'); // move right
		this.spaceKey = this.scene.input.keyboard.addKey('SPACE'); // interact
		this.detectEvents();
		this.isInteracting = false;
		this.shopping = false;

		// añadimos físicas
		scene.physics.add.existing(this);

		// Ajustamos el "collider" de manín
		this.bodyOffset = this.body.height/10;
		this.bodyWidth = this.body.width/2;
		//#region animaciones
		this.scene.anims.create({
			key: 'move', //identificador de la animación
			frames: scene.anims.generateFrameNumbers('manin_move', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:7 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 10, // imágenes/frames por segundo
			repeat: 0
		});

		this.scene.anims.create({
			key: 'pop', //identificador de la animación
			frames: scene.anims.generateFrameNumbers('manin_pop', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:27 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 7, // imágenes/frames por segundo
			repeat: 0
		});
		this.scene.anims.create({
			key: 'pose', //identificador de la animación
			frames: scene.anims.generateFrameNumbers('manin_pose', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:27 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 10, // imágenes/frames por segundo
			repeat: 0
		});

		this.on('animationcomplete', end =>{ //evento que se ejecuta cuando una animación ha terminado
			//console.log(this.anims.currentAnim.key)
			if(this.anims.currentAnim.key === 'pose') this.play('pop');
			else if(this.anims.currentAnim.key === 'pop')this.play('pose');
			else if(this.anims.currentAnim.key === 'move' &&(this.dKey.isDown||this.aKey.isDown||this.sKey.isDown||this.wKey.isDown)){ //comprobamos si la animación que ha terminado es 'attack'
				this.play('move'); //ejecutamos la animación 'idle'
			}
			else{
				this.play('pose');
			}
		});
		this.play('pose');
		//#endregion
	}
	
	// interacción 
    interact(){
		this.isInteracting = true;
		if(this.collider instanceof QuestNPC){
			if(!this.collider.quest.acquired){
				this.collider.activateQuest();
				this.collider.currentlyTalking = true;
				this.scene.scene.get('hud').events.emit("updateQuestHUD");
			}
			else if(this.collider.quest.id === "batallaDevs" && this.collider.quest.stages !== this.collider.quest.stage && !this.collider.quest.actualObjectiveCompleted){
				this.collider.advanceQuest();
				this.scene.scene.get('hud').Reset();
				this.scene.scene.get('hud').events.emit("updateQuestHUD");
			}
			else if(this.collider.quest.id === "sanxeMision" && this.collider.quest.stages !== this.collider.quest.stage && !this.collider.quest.actualObjectiveCompleted){
				if(allyParty.inventory.money >= 500){
					allyParty.inventory.money -= 500;
					this.collider.advanceQuest();
					this.scene.scene.get('hud').Reset();
					this.scene.scene.get('hud').events.emit("updateQuestHUD");
				}
			}
			else if(this.collider.quest.stages !== this.collider.quest.stage && this.collider.quest.actualObjectiveCompleted){
					this.collider.advanceQuest();
					this.scene.scene.get('hud').events.emit("updateQuestHUD");

			}
			else if(this.collider.quest.id === "porroQuest" && this.collider.quest.stages !== this.collider.quest.stage && !this.collider.quest.actualObjectiveCompleted){
				let i = allyParty.inventory.isItem('Porro', 0);
				if(i !== allyParty.inventory.inv.length){
					allyParty.inventory.removeItem(new Object('Porro', -5, 20, 20, 'porro', "Un porro. Ya está, no vamos a decir mucha cosa más que la Audiencia Nacional está muy pendiente de este juego."));
					this.collider.advanceQuest();
					this.scene.scene.get('hud').Reset();
					this.scene.scene.get('hud').events.emit("updateQuestHUD");
				}
			}
			this.isInteracting = false;
		}
		else if(this.collider instanceof shopNPC){
			this.shopping = true;
			this.collider.currentlyTalking = true;
			this.collider.readDialogues();
		}
		else if(this.collider instanceof NPC) {
			if(this.collider.npcID === 28) this.isInteracting = false;
			else {
				this.scene.scene.sleep('hud');
				this.collider.currentlyTalking = true;
				this.collider.readDialogues();
			}
		}
		else if(this.collider instanceof AllyTEST) 
		{ 
			allyParty.Add(this.collider.info);
			this.scene.scene.get('hud').Reset();
			this.collider.trigger.destroy();
			this.collider.destroy();
			this.isInteracting = false;
		}
		else if(this.collider instanceof interactuableObj){
			this.collider.Interact();
			this.isInteracting = false;
		}
		else if(this.collider === null) this.isInteracting = false;
    }

	detectEvents() {
		this.scene.events.on('dialogWindowClosed', () => {
			this.isInteracting = false;
			this.scene.scene.wake('hud');
		})
		this.scene.events.on('closeShopping', () => {
			this.scene.scene.wake('hud');
			this.shopping = false;
		})
	}

	/**
	 * Bucle principal del personaje, actualizamos su posición y ejecutamos acciones según el Input
	 * @param {number} t - Tiempo total
	 * @param {number} dt - Tiempo entre frames
	 */

	preUpdate(t, dt) {
		// Es muy imporante llamar al preUpdate del padre (Sprite), sino no se ejecutará la animación
		super.preUpdate(t, dt);

		if((Phaser.Input.Keyboard.JustDown(this.wKey)||Phaser.Input.Keyboard.JustDown(this.sKey)||Phaser.Input.Keyboard.JustDown(this.dKey)||Phaser.Input.Keyboard.JustDown(this.aKey)) && !this.isInteracting)
		{
			this.play('move');
			
		}
		this.dKey.isDown
		// Mientras pulsemos la tecla 'A' movemos el personaje en -X
		if(this.aKey.isDown && !this.isInteracting){
			//this.play('move');
			this.setFlip(true, false)
			//this.x -= this.speed*dt / 1000;
			this.body.setVelocityX(-100*dt*this.speed/1000);
			this.zone.x = this.body.x + this.displayWidth/2;
			this.zone.y = this.body.y + 2.5*this.displayHeight / 3;
            this.increaseSteps()
		}

		// Mientras pulsemos la tecla 'D' movemos el personaje en +X
		if(this.dKey.isDown && !this.isInteracting){
			//this.play('move');	
			this.setFlip(false, false)
			//this.x += this.speed*dt / 1000;
			this.body.setVelocityX(100*dt*this.speed/1000);
			this.zone.x = this.body.x + this.displayWidth/2;
			this.zone.y = this.body.y + 2.5*this.displayHeight / 3;
			this.increaseSteps()
			
		}

		// Phaser.Input.Keyboard.JustUp y Phaser.Input.Keyboard.JustDown nos aseguran detectar la tecla una sola vez (evitamos repeticiones)
		if(Phaser.Input.Keyboard.JustUp(this.aKey) || Phaser.Input.Keyboard.JustUp(this.dKey)){
			this.body.setVelocityX(0);
		
		}
		// Mientras pulsemos la tecla 'S' movemos el personaje en -Y
		if(this.sKey.isDown && !this.isInteracting){
			//this.play('move');
            this.body.setVelocityY(100*dt*this.speed/1000);
			this.zone.x = this.body.x + this.displayWidth/2;
			this.zone.y = this.body.y + 2.5*this.displayHeight / 3;
            this.increaseSteps()
		}

		// Mientnras pulsemos la tecla 'W' movemos el personaje en -Y
		if(this.wKey.isDown && !this.isInteracting){
			//this.play('move');
            this.body.setVelocityY(-100*dt*this.speed/1000);
			this.zone.x = this.body.x + this.displayWidth/2;
			this.zone.y = this.body.y + 2.5*this.displayHeight / 3;
            this.increaseSteps()
		}

        if(Phaser.Input.Keyboard.JustUp(this.wKey) || Phaser.Input.Keyboard.JustUp(this.sKey)){
            this.body.setVelocityY(0);
        }

		// Si pulsamos 'SPACE' interactuamos con nuestro entorno
		if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.wKey.isDown && !this.sKey.isDown && !this.dKey.isDown && !this.aKey.isDown){
			this.interact();
		}

		// si hemos caminado 100 pasos, entramos en combate (TEMPORAL)

        if((this.stepsWalked > 100 && (this.random < PROBABILIDAD_COMBATE)) || (this.stepsWalked > 2000)){
			this.random = 100;
            this.stepsWalked = 0;
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
            this.scene.scene.get('EnvManager').fight();
        }
	}

	increaseSteps(){
		if(this.touchingGrass) 
		{
			this.random = Math.floor(Math.random() * 300);
			this.stepsWalked++;
			}
	}
}
