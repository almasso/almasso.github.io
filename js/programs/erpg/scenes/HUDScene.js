import { walkingHUD, ExploreMenu, QuestHUD, shopHUD, ChooseDev } from "../fight/HUD.js";
import { InputMan } from "../fight/InputManager.js";

const State = {
    Fight: 0,
    Walk: 1,
	Init: 2
}

export default class HUDScene extends Phaser.Scene {

    constructor() { // constructora
		super({ key: 'hud'});

	}

    create(){
		this.shops = [];
		this.state = State.Init;
        // generamos HUD de estado de party
		this.inputMan = new InputMan(this); // input manager
		this.walkingHUD = new walkingHUD(40, 500, this, 'miniHUD') // HUD de cabezas pequeñas
		this.pointer = this.add.image(0, 0, 'pointer').setOrigin(0,0); // puntero para apuntar a las diferentes opciones
		this.pointer.visible = false;
		this.pointer.depth = 3;
		// generamos el Menú general
		this.menu = new ExploreMenu(620, 100, this, 'menuBG', this.pointer, this.walkingHUD);
		this.questHud = new QuestHUD(this);
		this.questHud.Update();
		this.showMenu = false;
		this.menu.Show(false);
		this.events.on("updateQuestHUD", () => {
			this.questHud.Update();
		});
		this.state = State.Walk;
    }
    
    update(){ // checkeo de variables e input
		if(this.state === State.Walk){ // mostramos menú a la Q
			if(Phaser.Input.Keyboard.JustDown(this.inputMan.qKey)) {
				this.showMenu = !this.showMenu; 
				if(this.showMenu) { this.menu.Show(this.showMenu); }
				else {
					this.menu.Hide(!this.showMenu);
					this.menu.viewParty = false;
					this.menu.manageParty = false;
				} 
			}
		}
	}

	CreateDevMenu(){
		this.devMenu = new ChooseDev(200, 200, this);
	}

	UpdateHUD(){ // updateamos el HUD
		this.walkingHUD.Update();
		this.questHud.Update();
		this.menu.Update();
	}

	addQuest(quest){
		this.menu.AddQuest(quest);
	}

	addShop(npc){
		let newShop = new shopHUD(this, npc.items, npc);
		this.shops.push(newShop);
		return newShop;
	}

	addItem(item){
		this.menu.AddItem(item);	
	}

	updateItem(item){
		this.menu.UpdateItem(item);
	}

	Fight(){
		this.state = State.Fight;
		this.Hide(true);
	}

	Hide(boolean){
		this.showMenu = !boolean;
		this.walkingHUD.Hide(boolean);
		if(!boolean) {this.menu.Hide(true); this.showMenu = false;}
		if(this.questHud !== undefined) this.questHud.Hide(boolean);
	}

	Walk(){
		this.state = State.Walk;
		this.Hide(false);
	}

	Reset(){
		this.walkingHUD = new walkingHUD(40, 500, this, 'miniHUD');		
		this.pointer = this.add.image(0, 0, 'pointer').setOrigin(0,0); // puntero para apuntar a las diferentes opciones
		this.pointer.visible = false;
		this.pointer.depth = 3;
		this.menu = new ExploreMenu(620,100,this,'menuBG', this.pointer, this.walkingHUD);
		this.showMenu = false;
		this.menu.Show(this.showMenu);
	}
}