export {EnviromentInfo, EnemiesInfo, EnviromentManager};
import {attackInfo} from "../fight/Attack.js"
import { allyParty } from "./Party.js";

const scenes = {
	square: 0,
	park: 1,
	cementery: 2,
	port: 3,
	cinematic1:4,
	cinematic2:5,
	cinematic3:6
};

let hudKey = 'hud';
let fightKey = 'fightscene';

// esta clase gestionará el cambio entre escenarios y escenas.
class EnviromentManager extends Phaser.Scene{
	constructor(){
		// gestor de escenas. tenemos que hacer que se cambie en el momento de cambiar entre escenas.
		super({key: 'EnvManager'});
	}

	create(){
		for (let e of sceneInfo){
			e.launched = false;
		}
		this.coreScene = scenes.cinematic1;
		this.currentScene = scenes.cinematic1;
		this.info = sceneInfo[this.coreScene];
		this.initializeGame();
	}

	initializeGame(){
		this.startTransition();
		this.endTransition();
		EnviromentInfo = sceneInfo[this.coreScene];
		this.scene.launch(sceneInfo[this.coreScene].key);
		console.log(sceneInfo[this.coreScene]);
		this.scene.launch(hudKey);
		this.hudScene = this.scene.get(hudKey);	
		this.hudScene.Reset();
	}

	fight(){
		console.log(sceneInfo[this.currentScene].key);
		this.scene.sleep(sceneInfo[this.currentScene].key);
		this.scene.get(sceneInfo[this.currentScene].key).musica.stop();
		this.scene.sleep(hudKey);
		this.scene.launch(fightKey, {loadFromEnviroment: false, specialEncounterIndex: 0});
		this.scene.get(fightKey).LoadInventory(allyParty.inventory);
	}

	walk(bool){
		if(bool){
			for(let i of sceneInfo){
				this.scene.stop(i.key);
			}
			this.scene.launch('final');
		}
		else{
			console.log(this.currentScene.key);
			if(sceneInfo[this.currentScene].key === 'port'){
				console.log("createDevMenu");
				this.hudScene.CreateDevMenu();
			}
			this.scene.wake(sceneInfo[this.currentScene].key);
			this.scene.get(sceneInfo[this.currentScene].key).musica.play();
			this.scene.wake(hudKey);
			this.hudScene.Walk();
			this.hudScene.UpdateHUD();
		}
	}

	startTransition(){
		
	}

	endTransition(){
		
	}

	changeScene(index){
		this.startTransition();
		this.endTransition();
		let sleepKey = this.info.key;
		this.info = sceneInfo[index];
		if(sceneInfo[index].launched) {
			this.scene.wake(sceneInfo[index].key);
			this.scene.get(sceneInfo[index].key).musica.play();
		}
		else {
			this.scene.launch(sceneInfo[index].key);
			sceneInfo[index].launched = true;
		}
		this.scene.sleep(sleepKey);
		this.scene.get(sleepKey).musica.stop();
		EnviromentInfo = this.info;
		this.currentScene = index;
	}

	goToPlaza(){
		this.startTransition();
		this.endTransition();
		let sleepKey = this.info.key;
		this.info = sceneInfo[this.coreScene];
		this.scene.wake(sceneInfo[this.coreScene].key);
		this.scene.sleep(sleepKey);
	}
}
let cinematic1 = {
	launched: true,
	key: 'cinematic1',
	bg: 'plazaNoche',
	character: [],	
	npcs: [
		npcInfo(600,400, 'dinostatue', 0),
		npcInfo(600,400, 'dinoRoto', 0),
		npcInfo(300,400, 'delincuente', 0),
		npcInfo(900,400, 'delincuente', 0),
		npcInfo(600,600, 'delincuente', 0)
	],
	qNpcs: [],
	sNpcs: [
	],
	hNpcs:  [
	],
	hostile: [],
	eObj: [eObjInfo(600, 680, 'z1', 0.5, 0.5),eObjInfo(600, 450, 'intro', 1, 1),eObjInfo(100, 250, 'emptyBar', 1,1),eObjInfo(1050, 425, 'emptyShop', 1,1)],
	iObj: [],
	travel: [
		travelInfo(600, 50, 'pixel', 100, 100, scenes.square)
	]
}

let cinematic2 = {
	launched: false,
	key: 'cinematic2',
	bg: 'angelPark',
	character: [],
	npcs: [
		npcInfo(600,-100, 'angel', 0),
		
	],
	qNpcs: [],
	sNpcs: [
	],
	hNpcs:  [
	],
	hostile: [],
	eObj: [eObjInfo(300, 500, 'textAngel', 1, 1)],
	iObj: [],
	travel: [
		travelInfo(600, 1600, 'pixel', 100, 100, scenes.park)
	]
}


let cinematic3 = {
	launched: false,
	key: 'cinematic3',
	bg: 'bg_dino',
	fightbg: 'fightParkBg',
	character: [],
	npcs: [
		npcInfo(400,250, 'dino_wake', 0),
		
	],
	qNpcs: [],
	sNpcs: [
	],
	hNpcs:  [
	],
	hostile: [],
	eObj: [eObjInfo(425, 500, 'textDino', 1, 0.9)],
	iObj: [],
	travel: [
		travelInfo(600, 1600, 'pixel', 100, 100, scenes.square)
	]
}

let nombresSanxe = ["Pedro Sánchez", "Otto Frauden", "Elim Postor", "Chan Chu-yo", "Pierre d'Elvotto", "Hurto Sinescrupoulos", "Gandhi Sima Farsa", "Massimo Atracco", 
					"Tekito Tuboto", "Mestafa Al-Votar", "Pedro das Trampas", "Ami Mewele Atrampa", "Jo Dan-sen", "Falconetti", "Mr. Handsome", "Silvio Panada", "T. Van Astaffar",
					"Abraham Urnas", "Ivan A. Timar", "T. des Falco do Nascimento", "Pancho R. Obando", "Many Puleo"];

let square = {
	launched: false,
	key: 'square',
	bg: 'square',
	fightbg: 'fightParkBg',
	character: [],//[{x: 300,y:300, name: "Melendi", imgID: 'melendi', actualHp: 75, maxHp: 75, actualMp: 115, maxMp: 115,
	// rP: 4, rR: 6, rF: 3, rE: 7, rT: 5, acurracy: 90, speed: 60,
	// attack: [attackInfo("A Rango 1 Target", 1, 25, 0, 1), attackInfo("A Rango 2 Target", 1, 20, 30, 1), 
	// attackInfo("Support 1 Target", 5, -20, 25, 1), attackInfo("Camina por la Vida",5,-70,60,1)]}],
	
	npcs: [
		npcInfo(500,800, 'verifiedtoni', 7), 
		npcInfo(700, 800, 'pepperboy', 8), 
		npcInfo(275, 250, 'jatsune', 2),
		npcInfo(1100,175, 'frozono', 4),	
		npcInfo(925,500, 'homero', 28), //homer no tiene diálogos
		npcInfo(750,50, 'spider', 19),
		npcInfo(50,500, 'patrik', 18),
		npcInfo(150,525, 'bob', 17),
		npcInfo(700,550, 'rick', 25),
		npcInfo(1070,720, 'tiolavara', 24),
		npcInfo(250, 750, 'andrea', 12)
	],
	qNpcs: [
		qNpcInfo(600, 350, 'dinoRoto', 28, 3, "statueQuest", "Dinoseto", 3, ["Recupera la primera pieza del dinoseto",
		 "Recupera la segunda pieza del dinoseto", "Recupera la tercera pieza del dinoseto"],
		"oh no me han robado el coraçao ayúdame jardinero apuesto", 'dinoRoto', 'Concello de Vigo'),
		qNpcInfo(450, 550, 'sanxe', 28, 5, "sanxeMision", "Impuestos", 1, ["Paga 500 euros a Pdr Sánchez"],
		 "Pedro Sánchez ha accedido a ayudarte si le pagas 500 euros de impuestos", 'sanxe', nombresSanxe[Math.floor(Math.random() * nombresSanxe.length)])
	],
	sNpcs: [
		sNpcInfo(1050, 400, 'tienda', 9, [
			itemInfo("Cigarro", -5, 10, 10, 'cigarro', "Este cigarro te dará estilo en los pulmones, úsalo con precaución."), 		
			itemInfo('Kebab', 10, -5, 10,'kebab', "Un kebab sacado del garito más sucio y rancio que podrás encontrar. Eso le da un plus de sabor y olor."), 
			itemInfo('Fría', 20, -5, 20, 'fria', "La bebida favorita de aquellos que luchan contra el apollardamiento. Esperemos que no sea Cruzcampo."), 
			itemInfo('Porro', -5, 20, 20, 'porro', "Un porro. Ya está, no vamos a decir mucha cosa más que la Audiencia Nacional está muy pendiente de este juego."), 
			itemInfo('Dalsy Naranja', 10, 0, 15, 'dalsyN', "Es como ibuprofeno pero sin el como. Y además líquido. Naranjita. Y sabe bien."),
			itemInfo('Dalsy Fresa', 0, 10, 15, 'dalsyF', "Es como ibuprofeno pero sin el como. Y además líquido. Rosita. Y sabe bien."),
			itemInfo('Ibuprofeno 200mg', 15, 0, 15, 'i200', "Es como Dalsy pero sin el como. Esta vez te toca tragarte una piedra. Está asqueroso, pero es muy eficaz."),
			itemInfo('Ibuprofeno 600mg', 30, 0, 30, 'i600', "Es como Dalsy pero sin el como. Esta vez te toca tragarte una piedra. Está asqueroso, pero es muy eficaz."),
			itemInfo('Ibuprofeno 1g', 45, 0, 45, 'i1', "Es como Dalsy pero sin el como. Esta vez te toca tragarte una piedra. Está asqueroso, pero es muy eficaz.")
		])
	],
	hNpcs:  [
		npcInfo(100, 250, 'health', 11)
	],
	character : [
		{
			x: 450,
			y : 550,
			name: nombresSanxe[Math.floor(Math.random() * nombresSanxe.length)], 
			imgID: 'sanxe', 
			actualHp: 85, 
			maxHp: 85, 
			actualMp: 115, 
			maxMp: 115,
			rP: 6, 
			rR: 3, 
			rF: 6, 
			rE: 5, 
			rT: 4, 
			acurracy: 90, 
			speed: 60, 
			attack: [
				attackInfo("Bono Cultural Joven", 0, 20, 0, 1), 
				attackInfo("Chuletón al punto", 2, 35, 30, 1), 
				attackInfo("Ataque Falcon", 1, 20, 25, 2), 
				attackInfo("Instaurar la República",0,50,60,3) 
		]
	}],
	hostile: [],
	eObj: [
		eObjInfo(1000, 150, 'pixel', 150, 100),
		eObjInfo(540, 275, 'pixel', 140, 50),
		eObjInfo(600, 375, 'pixel', 250, 75),
		eObjInfo(600, 325, 'pixel', 150, 50)
	],
	iObj: [],
	travel: [
		travelInfo(1195, 850, 'pixel', 100, 100, scenes.park),
		travelInfo(10, 850, 'pixel', 100, 100, scenes.cementery),
		travelInfo(600, 50, 'pixel', 100, 100, scenes.port),
		travelInfo(-100, -100, 'pixel', 100, 100, scenes.cinematic3)
	],
	specialEncounter: [
		{
			numEnemies: 1, 
			enemies: [
				{
					name: "Dinoseto", 
					imgID:'dinoseto', 
					actualHp: 300, 
					maxHp: 300, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 4, 
					rR: 5, 
					rF: 3, 
					rE: 7, 
					rT: 7, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("Mordisco",1,25,0,1),
						attackInfo("Rugido", 3, 15, 0, 1),
						attackInfo("Lanzatoxinas", 4, 10, 0, 1)
					]
				}
			],
			money: 5000
		}
	]
}


// información de los personajes que se encuentran en el parque
let park = {
	launched: false,
	key: 'park',
	bg: 'park',
	fightbg: 'fightParkBg',
	npcs: [
		npcInfo(1300,400, 'patri', 10),
		npcInfo(830,50, 'compuman', 5),
		npcInfo(100,300, 'unverifiedtoni', 6),
		npcInfo(800,700, 'elmotivao', 0),	
		npcInfo(950,860, 'vovovo', 1),
		npcInfo(250,950, 'joker', 15),
		npcInfo(1500,850, 'aloy', 16),
		npcInfo(1550,150, 'sirenita', 14),
		npcInfo(1000,600, 'ikerJimenez', 27),
		npcInfo(50,400, 'PabloMotos', 21)
	],
	qNpcs: [
		qNpcInfo(1305, 142, 'fisher', 28, 1, "fishingRod", "Caña de pescar", 3, ["Encuentra su caña de pescar",   // Pescador
		"Observa el lago", "Pelea con la estatua"], "Un buen hombre te ha pedido que recuperes su caña de pescar en el parque local. Más te vale hacerlo, es lo que haría Manín.",
		'manin','uno que pesca'),
		qNpcInfo(550, 90, 'melendi', 28, 0, "guitarQuest","Mi Guitarra", 1, ["Recupera la Guitarra"],
		"esto es un testeo por cierto. esta misión es un testeo sabes", 'melendi', 'el mendas'),
		qNpcInfo(500, 500, 'jarfaiter', 28, 2, "porroQuest", "¿Quién fuma?", 1, ["Traele un porro"], "Jarfaiter se ha ofrecido a ayudarte si le das un porro, sino a lo mejor te mete una puñalada.", 'jarfaiter', 'el Jarfa')],
	sNpcs: [],
	hNpcs:  [],
	character: [
		{
			x: 550,
			y:90, 
			name: "Melendi",
			imgID: 'melendi', 
			actualHp: 75, 
			maxHp: 75, 
			actualMp: 115, 
			maxMp: 115,
			rP: 4, 
			rR: 6, 
			rF: 3, 
			rE: 7, 
			rT: 5, 
			acurracy: 90, 
			speed: 60,
			attack: [
				attackInfo("Lágrimas desordenadas", 1, 25, 0, 1), 
				attackInfo("Arrugas en el alma", 4, 20, 30, 1), 
				attackInfo("Magic Alonso", 5, -20, 25, 1), 
				attackInfo("Camina por la Vida",5,-70,60,1)
			]
		},
		{
			x: 500,
			y:500, 
			name: "Jarfaiter", 
			imgID: 'jarfaiter', 
			actualHp: 75, 
			maxHp: 75, 
			actualMp: 115, 
			maxMp: 115,
			rP: 4, 
			rR: 6, 
			rF: 3, 
			rE: 7, 
			rT: 5, 
			acurracy: 90, 
			speed: 60, 
			attack: [
				attackInfo("Navajeros", 0, 20, 0, 1), 
				attackInfo("Quiero que ardas", 2, 35, 30, 1), 
				attackInfo("Ven a 4k", 0, 20, 25, 2), 
				attackInfo("Porro",4,50,60,3)
			]
		}
	],
	enemies: [
		{
			name: "Artista", 
			imgID:'artist', 
			actualHp: 70, 
			maxHp: 70, 
			actualMp: 0, 
			maxMp: 0, 
			rP: 5, 
			rR: 4, 
			rF: 5, 
			rE: 5, 
			rT: 6, 
			acurracy: 90, 
			speed: 40,
			attack: [
				attackInfo("Pincelada",1,20,0,1),
				attackInfo("Lanza un bote de pintura", 1, 15, 0, 1),
				attackInfo("Xilografía en el pecho", 1, 30, 0, 1)
			],
			money: 100
		},
		{
			name: "Culturista", 
			imgID:'people', 
			actualHp: 80, 
			maxHp: 80, 
			actualMp: 0, 
			maxMp: 0, 
			rP: 8, 
			rR: 6, 
			rF: 4, 
			rE: 3, 
			rT: 6, 
			acurracy: 85, 
			speed: 60,
			attack:[
				attackInfo("Te flexeo el cráneo", 3, 40, 0, 1), 
				attackInfo("Súper patada volador con un nombre increíblemente largo",0,45,0,1),
				attackInfo("Poñetaso", 0, 30, 0, 1)
			],
			money: 100
		}
	],
	hostile: [
		hostileInfo(875,310,'hierba', 3, 2, 2.5),
		hostileInfo(725,825,'hierba', 1, 1, 2.5),
		hostileInfo(650,900,'hierba', 1, 1, 2.5),
		hostileInfo(600,550,'hierba', 2, 1, 2.5),
		hostileInfo(1040,860,'hierba', 3, 2, 2.5),
		hostileInfo(875,700,'hierba', 3, 2, 2.5),
		hostileInfo(965,230,'hierba', 1, 1, 2.5),
		hostileInfo(800,150,'hierba', 2, 2, 2.5),
		hostileInfo(1500,335,'hierba', 2, 2, 2.5),
		hostileInfo(1400,500,'hierba', 3, 2, 2.5),
		hostileInfo(300, 50, 'hierba', 3, 2, 2),
		hostileInfo(335, 180, 'hierba', 2, 1, 2),
		hostileInfo(150, 400, 'hierba', 1, 1, 2),
		hostileInfo(200, 500, 'hierba', 1, 1, 2),
		hostileInfo(350, 850, 'hierba', 2, 3, 2),
		hostileInfo(25, 850, 'hierba', 5, 1, 2),
		hostileInfo(25, 725, 'hierba', 7, 2, 2)
	],
	eObj: [
		eObjInfo(0, 265, 'tree', 6.5, 6.5),
		eObjInfo(126, 900, 'tree', 7, 7),
		eObjInfo(693, 25, 'tree', 7, 7),
		eObjInfo(1575, 640, 'tree', 7, 7),
		eObjInfo(1388, 785, 'ten', 4, 4),
		eObjInfo(1500, 20, 'pixel', 300, 300),
		eObjInfo(1200, 20, 'pixel', 400, 100)
	],
	iObj: [
		eObjInfo(840, 950, 'caña', 0.7, 0.7),  // Caña de pescar
		eObjInfo(1205, 120, 'flecha', 0.7, 0.7),   // Observar el lago
		eObjInfo(1400, 225, 'angel', 0.7, 0.7),   // Pelea
		eObjInfo(1205, 120, 'piezaDino', 0.7, 0.7),   // Item
		eObjInfo(40, 620, 'guitarra', 0.7, 0.7),   // Guitarra
		
	],
	travel: [
		travelInfo(10, 60, 'pixel', 100, 100, scenes.square),
		travelInfo(800, 15000, 'pixel', 100, 100, scenes.cinematic2)
	],
	specialEncounter: [
		{
			numEnemies: 1, 
			enemies: [
				{
					name: "Angel Caido", 
					imgID:'angel', 
					actualHp: 150, 
					maxHp: 150, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 6, 
					rR: 5, 
					rF: 4, 
					rE: 6, 
					rT: 4, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("Pedrada",1,20,0,1),
						attackInfo("Tentación", 4, 15, 0, 1),
						attackInfo("Lanzallamas", 2, 10, 0, 1)
					]
				}
			],
			money: 500
		}
	]
}
//información de los personajes que se encuentran en el cementerio
let cementery = {
	launched: false,
	key : 'cementery',
	bg: 'clif',
	npcs: [
		npcInfo(485,125, 'kratos', 13)
	],
	qNpcs: [],
	 sNpcs: [],
	 hNpcs:  [],
	 character: [],
	enemies: [],
	hostile: [],
	eObj: [
		eObjInfo(200, 300, 'insignia', 0.5, 0.5),
		eObjInfo(650, 170, 'pixel', 320, 0.5),
		eObjInfo(460, 0, 'pixel', 0.5, 500),
		eObjInfo(650, 74, 'pixel', 320, 0.5),
	],
	iObj: [
		eObjInfo(500, 125, 'piezaDino', 3.5, 3.5)
		
	],
	travel: [
		travelInfo(800, 120, 'pixel', 70, 70, scenes.square)
	]
}
//información de los personajes que se encuentran en el puerto
let port = {
	launched: false,
	key: 'port',
	bg: 'home',
	fightbg: 'fightHomeBg',
	npcs: [
		npcInfo(75,380, 'alex', 3),
		npcInfo(200,380, 'raul', 22),
		npcInfo(620,380, 'roi', 26), 
		npcInfo(760,380, 'pablo', 29), 
		npcInfo(400,380, 'david', 30)
	],
	qNpcs: [qNpcInfo(400, 380, 'david', 28, 4, "batallaDevs", "Testeo rutinario", 1, ["Vuelve a hacerte el testeo"],
	 "Los devs te han pedido que vuelvas a hacerte pruebas de testeo, ya que seguramente tengas fallos", 'david', 'David')],
	 sNpcs: [],
	 hNpcs:  [],
	 character: [],
	enemies: [],
	hostile: [],
	eObj: [
		eObjInfo(500, 125, 'text', 2.5, 2.5),
		eObjInfo(500, 420, 'pixel', 1000, 0.1)
	],
	iObj: [ 
	eObjInfo(250,400,'piezaDino', 0.1, 0.1)],
	travel: [
		travelInfo(400, 600, 'pixel', 70, 70, scenes.square)
	],
	character: [{
		name: "Roi", 
		imgID:'roi', 
		actualHp: 110, 
		maxHp: 110, 
		actualMp: 100, 
		maxMp: 100, 
		rP: 5, 
		rR: 5, 
		rF: 5, 
		rE: 5, 
		rT: 5, 
		acurracy: 90, 
		speed: 40,
		attack: [
			attackInfo("'Payaso'",1,30,0,1),
			attackInfo("Foto Pizza", 2, 15, 30, 3),
			attackInfo("Sticker Gatito", 0, 30, 20, 1),
			attackInfo("2 Stickers Gatito", 0, 30, 50, 2)
		]},
		{
			name: "Raúl", 
			imgID:'raul', 
			actualHp: 80, 
			maxHp: 80, 
			actualMp: 110, 
			maxMp: 110, 
			rP: 8, 
			rR: 6, 
			rF: 4, 
			rE: 3, 
			rT: 6, 
			acurracy: 85, 
			speed: 60,
			attack:[
				attackInfo("Amenazar patito", 0, 40, 0, 1), 
				attackInfo("Comer una bandeja",1,20,0,2),
				attackInfo("Código de input", 4, 30, 0, 1),
				attackInfo("Patada en el estómago", 0, 65, 50, 1)
			]
		},
		{
			name: "Pablo VI", 
			imgID:'pablo', 
			actualHp: 120, 
			maxHp: 120, 
			actualMp: 80, 
			maxMp: 80, 
			rP: 8, 
			rR: 5, 
			rF: 5, 
			rE: 1, 
			rT: 5, 
			acurracy: 90, 
			speed: 40,
			attack: [
				attackInfo("Hincar por el culo",0,20,0,1),
				attackInfo("Chiste monje", 1, 15, 15, 2),
				attackInfo("Ausencia de césped", 3, 30, 25, 1),
				attackInfo("Calle", 0, 25, 40, 2)
			]
		},{
			name: "Alex", 
			imgID:'alex', 
			actualHp: 100, 
			maxHp: 100, 
			actualMp: 130, 
			maxMp: 130, 
			rP: 4, 
			rR: 6, 
			rF: 3, 
			rE: 5, 
			rT: 8, 
			acurracy: 90, 
			speed: 40,
			attack: [
				attackInfo("Datos de Wikipedia",4,20,0,1),
				attackInfo("Testerazo", 0, 25, 20, 1),
				attackInfo("La vara de avellano", 0, 30, 25, 1),
				attackInfo("Puñetazo muy fuerte", 0, 75, 70, 1)
			]
		},{
			name: "David", 
			imgID:'david', 
			actualHp: 95, 
			maxHp: 95, 
			actualMp: 120, 
			maxMp: 120, 
			rP: 3, 
			rR: 7, 
			rF: 5, 
			rE: 6, 
			rT: 2, 
			acurracy: 90, 
			speed: 40,
			attack: [
				attackInfo("*uwu* al oído",3,25,0,1),
				attackInfo("Problemas intestinales", 4, 15, 25, 2),
				attackInfo("Alcalá de Henares", 1, 30, 15, 1),
				attackInfo("Un jodido ladrillo", 0, 65, 50, 1)
			]
		}
	],
	specialEncounter: [
		{
			numEnemies: 5, 
			enemies: [
				{
					name: "David", 
					imgID:'david', 
					actualHp: 95, 
					maxHp: 95, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 3, 
					rR: 8, 
					rF: 5, 
					rE: 6, 
					rT: 2, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("susurrarle *uwu* al oído",3,25,0,1),
						attackInfo("problemas gastrointestinales", 4, 15, 0, 2),
						attackInfo("vivir en Alcalá de Henares", 1, 30, 0, 1)
					]
				},
				{
					name: "Raúl", 
					imgID:'raul', 
					actualHp: 80, 
					maxHp: 80, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 8, 
					rR: 6, 
					rF: 4, 
					rE: 3, 
					rT: 6, 
					acurracy: 85, 
					speed: 60,
					attack:[
						attackInfo("amenazar su patito de goma", 0, 40, 0, 1), 
						attackInfo("comerse una bandeja entera sin temblar",1,20,0,2),
						attackInfo("enseñar código de input", 4, 30, 0, 1)
					]
				},
				{
					name: "Roi", 
					imgID:'roi', 
					actualHp: 110, 
					maxHp: 110, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 5, 
					rR: 5, 
					rF: 5, 
					rE: 5, 
					rT: 5, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("llamarle 'payaso'",1,30,0,1),
						attackInfo("una foto de su pizza", 2, 15, 0, 3),
						attackInfo("sticker de gatito", 0, 30, 0, 1)
					]
				},
				{
					name: "Alex", 
					imgID:'alex', 
					actualHp: 100, 
					maxHp: 100, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 7, 
					rR: 7, 
					rF: 3, 
					rE: 6, 
					rT: 9, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("datos estúpidos de Wikipedia",4,20,0,1),
						attackInfo("testerazo", 0, 25, 0, 1),
						attackInfo("la vara de avellano", 0, 30, 0, 1)
					]
				},
				{
					name: "Pablo VI", 
					imgID:'pablo', 
					actualHp: 120, 
					maxHp: 120, 
					actualMp: 0, 
					maxMp: 0, 
					rP: 9, 
					rR: 5, 
					rF: 5, 
					rE: 1, 
					rT: 5, 
					acurracy: 90, 
					speed: 40,
					attack: [
						attackInfo("hincársela por el culo",0,20,0,1),
						attackInfo("chiste del monje", 1, 15, 0, 1),
						attackInfo("ausencia de césped", 3, 30, 0, 1)
					]
				}
			],
			money: 1500
		}
	]
}

function itemInfo(name, hp, mp, price, img, description) {
	return {name: name, hp: hp, mp: mp, price: price, img: img, description: description};
}

function npcInfo(x, y, img, id){
	return {x: x, y: y, img: img, id: id};
}

function sNpcInfo(x, y, img, id, items){
	return {x: x, y: y, img: img, id: id, items: items};
}

function qNpcInfo(x, y, img, id, qNPCID, qId, qName, qStages, qObj, qDesc, qImg, qNpcName){
	return {x: x, y: y, img: img, qNPCID : qNPCID, id: id, qId: qId ,qName: qName, qStages: qStages, qObj: qObj, qDesc: qDesc, qImg: qImg, qNpcName: qNpcName};
}

function hostileInfo(x, y, img, fils, cols, scale){
	return {x: x, y: y, img: img, fils: fils, cols: cols, scale: scale};
}

function eObjInfo(x, y, img, sX, sY){
	return {x: x, y: y, img: img, sX: sX, sY: sY};
}

function travelInfo(x, y, img, sX, sY, scene){
	return {x: x, y: y, img: img, sX: sX, sY: sY, scene: scene};
}

let sceneInfo = [square, park, cementery, port, cinematic1, cinematic2, cinematic3];


// variables exportadas
let EnviromentInfo = cinematic1;
let EnemiesInfo = park.enemies;