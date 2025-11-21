import {Manin, AllyTEST} from '../obj/manin.js';
import {enviromentObj, interactuableObj } from '../obj/enviromentObj.js';
import Bound from '../obj/bound.js';
import NPC from '../obj/npc.js';
import { EnviromentInfo } from '../fight/EnviromentInfo.js';
import { Quest, QuestNPC, QuestLog } from '../Quest.js';
import shopNPC from '../obj/shopNPC.js';
import Object from '../obj/Object.js';
import healerNPC from '../obj/healerNPC.js';
import {allyParty} from '../fight/Party.js'
// Escena de exploración (temporal de momento)
export default class FatherScene extends Phaser.Scene {

    constructor(key){
        super({key: key});
        this.manin;
        allyParty.inventory;
        this.grassColliders = [];
    }

    //#region input
	generateInput(){
		// input porque no funciona el InputMan. Vamos a tener que cambiarlo a una escena que controle input. qué feo
		this.spaceKey = this.input.keyboard.addKey('SPACE'); // interact
		this.sKey = this.input.keyboard.addKey('S');
		this.aKey = this.input.keyboard.addKey('A');
		this.wKey = this.input.keyboard.addKey('W');
		this.dKey = this.input.keyboard.addKey('D');
	}
	//#endregion

    create(){
		this.generateInput();
		//Imagen de fondo
		var bg = this.add.image(0, 0, EnviromentInfo.bg).setOrigin(0, 0);
		this.bordeX=bg.displayWidth;
		this.bordeY=bg.displayWidth;
		// bounds del mundo
        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

        // creamos a manín
		this.manin = new Manin(this, 300,400, this.scene.get('dialog'));
		//#region creamos los bordes del mundo
		let bLeft = new Bound(this, -1, 0,1,bg.displayHeight);
		let bRight = new Bound(this, bg.displayWidth, 0,1,bg.displayHeight);
		let bUp = new Bound(this, 0, -1,bg.displayWidth,1);
		let bDown = new Bound(this, 0, bg.displayHeight ,bg.displayWidth,1);

        // colisiones con los bordes
		this.physics.add.collider(this.manin, bg);
		this.physics.add.collider(this.manin, bLeft);
		this.physics.add.collider(this.manin, bDown);
		this.physics.add.collider(this.manin, bRight);
		this.physics.add.collider(this.manin, bUp);
		this.manin.body.onCollide = true;
		//#endregion

		// la cámara sigue a manín
        this.cameras.main.startFollow(this.manin);
		// cargamos diálogos de los NPCs
		this.npc_dialogues = this.cache.json.get('npc_dialogues');
		this.quest_dialogues = this.cache.json.get('quests');

        // #region generamos a los NPCs
		this.npcs = [];
		this.eObjs = [];
		this.interactuableObjects = [];

		for(let i of EnviromentInfo.npcs){
			let newNpc = new NPC(this, i.x, i.y, i.img, i.id, this.npc_dialogues, this.manin);
			this.npcs.push(newNpc);
		}
		for(let i of EnviromentInfo.sNpcs){
			let items = [];
			for(let o of i.items){
				items.push(new Object(o.name, o.hp, o.mp, o.price, o.img, o.description))
			}
			let newNpc = new shopNPC(this, i.x, i.y, i.img, i.id, this.npc_dialogues, this.manin, allyParty.inventory, items);
			this.npcs.push(newNpc);
		}
		for(let i of EnviromentInfo.hNpcs){
			let newNpc = new healerNPC(this, i.x, i.y, i.img, i.id, this.npc_dialogues, this.manin);
			this.npcs.push(newNpc);
		}
        for(let i of EnviromentInfo.character){
            let newAlly = new AllyTEST(this, i.x, i.y, this.manin, i);
			newAlly.trigger.setScale(0);
            this.npcs.push(newAlly);
        }
		for(let e of this.npcs) e.scale = 2.5;
		//#endregion

        // generamos el suelo 'hostil': donde se generan encuentros aleatorios
		for(let e of EnviromentInfo.hostile){
			this.GenerateHostileGround(e.x,e.y,e.fils,e.cols,e.scale,e.img)
		}

        // generamos cosas del entorno
		for(let e of EnviromentInfo.eObj){
			let newObj = new enviromentObj(this, e.x, e.y, e.img, e.sX, e.sY, this.manin);
			this.eObjs.push(newObj);
		}
        
        // generamos las "puertas" que nos cambiarán entre escenas
        this.changeScene();
    }

    generateIObjects(functions){
		let i = 0;
		for(let e of EnviromentInfo.iObj){
			let newObj = new interactuableObj(this, e.x, e.y, e.img, e.sX, e.sY, functions[i], this.manin);
			this.interactuableObjects.push(newObj);
			newObj.setScale(3);
			i++;
		}
    }

	generateQuests(functions){
		let j = 0;
		for(let i of EnviromentInfo.qNpcs){
			let newNpc = new QuestNPC(this, i.x,i.y, i.img, i.qNPCID, i.id, this.npc_dialogues, this.quest_dialogues, 
				this.manin, new Quest(i.qStages, i.qId, i.qName, i.qObj,i.qNpcName, i.qImg, i.qDesc, functions[j]));
			newNpc.setScale(2.5);
			this.npcs.push(newNpc);
			j++;
		}
	}

    changeScene(){
        this.sceneChangerCoords = [];
		this.changeCol = [];

        for(let i of EnviromentInfo.travel){
            this.sceneChangerCoords.push(new enviromentObj(this, i.x, i.y, i.img,i.sX,i.sY));
        }
		
		let self = this;
		let o = 0;
		for(let i of this.sceneChangerCoords){
			this.changeCol.push(this.add.zone(i.x, i.y).setSize(i.displayWidth, i.displayHeight));
			this.physics.world.enable(this.changeCol[o]);
			this.changeCol[o].body.setAllowGravity(false);
			this.changeCol[o].body.moves = false;
            let travelScene = EnviromentInfo.travel[o].scene;
			this.changeCol[o].on("overlapstart", () => {
				
					self.scene.get('EnvManager').changeScene(travelScene);
			});
			o++;
		}
    }

// generación de la hierba hostil (TEMPORAL)
GenerateHostileGround(x, y, fils, cols, scale, img){
    let hierbas = []; // array de hierbas
    // generamos las hierbas que se nos digan
    for(let i = 0; i < fils; i++){
        for(let o = 0; o < cols; o++){
            let h = new enviromentObj(this,x,y, img,scale,scale);
            h.x += h.displayWidth * i;
            h.y += h.displayHeight * o;
            hierbas.push(h);
        }
    }
    // añadimos la zona de colisión
    this.grassColliders.push(this.add.zone(x - hierbas[0].displayWidth / 2, y - hierbas[0].displayHeight / 2).setSize((hierbas[0].displayWidth) * fils,(hierbas[0].displayHeight) * cols).setOrigin(0,0));		
    this.physics.world.enable(this.grassColliders[this.grassColliders.length-1]); // añadimos su collider
    this.grassColliders[this.grassColliders.length-1].body.setAllowGravity(false); // quitamos gravedad
    this.grassColliders[this.grassColliders.length-1].body.moves = false;
    
    // creamos eventos para decirle a manín cuándo está tocando o no suelo hostil
    this.grassColliders[this.grassColliders.length-1].on("overlapstart", () =>{
        this.manin.touchingGrass = true;
    })
    this.grassColliders[this.grassColliders.length-1].on("overlapend", () =>{
        this.manin.touchingGrass = false;
        
    })
    // añadimos un overlap entre manín y esta nueva zona de colliders
    this.physics.add.overlap(this.manin.zone, this.grassColliders[this.grassColliders.length-1]);
}


    update(){
        let self = this;
		
		let hasCollidedGrass = false;
		
		this.grassColliders.forEach(function(colliders){
			
			let maninBounds = self.manin.zone.getBounds();
			let colliderGrassBounds = colliders.getBounds();
			
			if(Phaser.Geom.Intersects.RectangleToRectangle(maninBounds, colliderGrassBounds)){
				colliders.emit("overlapstart");
				hasCollidedGrass = true;
			}
			else if(!hasCollidedGrass){
				colliders.emit("overlapend");
			}
		});
	
        for(let i of this.changeCol){
			let maninBounds = self.manin.zone.getBounds();
			let changeZoneBounds = i.getBounds();
			
			if(Phaser.Geom.Intersects.RectangleToRectangle(maninBounds, changeZoneBounds)){
				if((self.aKey.isDown && i.x>0&&i.x<100) ||(self.dKey.isDown && i.x>this.bordeX-100)||(self.wKey.isDown&& i.y<100 && i.x<700&&i.x>300)||(self.sKey.isDown &&  i.y>500&& i.x>300&&i.x<700))
				{				
					i.emit("overlapstart");
					this.manin.body.setVelocityX(0);
					this.manin.body.setVelocityY(0);					
				}
			}
			
        }
		
		for(let i of this.npcs) {
			if(this.physics.world.overlap(this.manin, i.trigger) && this.manin.collider == null) {
				this.manin.collider = i;
			}
		}

		for(let i of this.interactuableObjects) {
			if(this.physics.world.overlap(this.manin, i.trigger) && this.manin.collider == null) {
				this.manin.collider = i;
			}
		}
		if(this.manin.collider != null && !this.physics.world.overlap(this.manin, this.manin.collider.trigger)){
			this.manin.collider = null;
		}
    }
}