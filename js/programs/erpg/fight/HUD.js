import { attackInfo } from "./Attack.js";
import { allyParty } from "./Party.js";
import { EnemiesInfo, EnviromentInfo } from "./EnviromentInfo.js";

// LOG DE COMBATE
export class Log {
	constructor(scene){
		this.scene = scene; // referencia a escena
		this.log = ["¡Comienza el combate!"]; // inicializamos el LOG
		this.img = this.scene.add.image(10, 490, 'log').setOrigin(0,0); // añadimos la imagen de fondo
		this.img.setScale(2,1); // setteamos su tamaño
		this.currentText = 0; // índice del texto actual
		this.verticalOffset = 25; // offset vertical
		this.CreateTexts(); // creamos los textos
		this.ShowLog();
	}

	// creación de textos
	CreateTexts(){
		// creamos los textos con vlaor base ---
		this.text3 = this.scene.add.text(this.img.x + 25, this.img.y + 15, "---", 
			{
			font: '18px "Arial"',
			color: '#ffffff',
			align: 'left',
			});
	
		this.text2 = this.scene.add.text(this.text3.x, this.text3.y + this.verticalOffset, "---", 
			{
			font: '18px "Arial"',
			color: '#ffffff',
			align: 'left',
			});
		
		// este texto se crea con el valor que tenga el array en la posición 0. será el primero que se cree
		this.text1 = this.scene.add.text(this.text2.x, this.text2.y + this.verticalOffset, this.log[this.currentText], 
			{
			font: '18px "Arial"',
			color: '#ffffff',
			align: 'left',
			});

		// cambiamos su profundidad
		this.text1.depth = 3;
		this.text2.depth = 3;
		this.text3.depth = 3;
	}

	// añadimos un nuevo texto
	AddText(text){
		this.log.push(text);
	}

	// actualizamos el texto
	UpdateLog(){
		this.currentText++; // movemos el índice
		this.ShowLog(); // mostramos esto
	}

	// vamos hacia arriba
	Up(){
		if(this.currentText !== 0){
			this.currentText--;
			this.ShowLog();
		}
	}

	// vamos hacia abajo
	Down(){
		if(this.currentText < this.log.length - 1){
			this.currentText++;
			this.ShowLog();
		}
	}

	// mostramos el log en función de la posición del currentText
	ShowLog(){
		this.text1.text = this.log[this.currentText];
		if(this.currentText - 1 < 0){
			this.text2.text = "---";
		}
		else this.text2.text = this.log[(this.currentText - 1)];
		if(this.currentText - 2 < 0){
			this.text3.text = "---";
		}
		else this.text3.text = this.log[(this.currentText - 2)];
	}
}

// ALIADOS EN COMBATE
export class AllyHUD{
	constructor(scene, character){
		this.block = scene.add.image(character.x, 0, 'AllyBlock'); // añadimos el fondo a la escena
		this.block.y += this.block.displayHeight/2; // setteamos su posición
		
		this.character = character; // referencia al personaje que representa el HUD
		
		// setteamos su bloque de ataques
		this.attackBlock = scene.add.image(this.block.x - 3*this.block.displayWidth/4, this.block.y*1.94, 'attackBlock').setOrigin(0,0);
		this.attackBlock.setScale(1.5,1);
		this.attackBlock.visible = false;

		// setteamos el texto de sus ataques
		this.attacks = [character.GetAttack(0), character.GetAttack(1), character.GetAttack(2), character.GetAttack(3)];
		this.CreateAttacks(scene);
		
		// setteamos las barras
		this.HealthBar = new HealthBar(scene, this.block.x - this.block.displayWidth/2.5, this.block.y + this.block.displayHeight/6, 8*this.block.displayWidth/10, 'HP', this.character.actualHp, this.character.maxHp);
		this.ManaBar = new HealthBar(scene, this.block.x - this.block.displayWidth/2.5, this.block.y + this.block.displayHeight/3.2, 8*this.block.displayWidth/10, 'MP', this.character.actualMp, this.character.maxMp);
		this.scene = scene;
	}

	// setteamos el texto de los ataques
	CreateAttacks(scene){
		this.attackText = []; // array de objetos: text, mp y srcAttack
		let self = this; // referencia al this
		this.attacks.forEach(function (attack, index) { // recorremos los ataques
			self.attackText[index] = { // creamos el texto
				text: scene.add.text(self.attackBlock.x + self.attackBlock.displayWidth / 14, self.attackBlock.y + index * self.attackBlock.displayHeight / 4 + self.attackBlock.displayHeight/16, attack.name, 
				{
				font: '12px "Arial"',
				color: '#ffffff',
				align: 'left',}), 

				mp: scene.add.text(self.attackBlock.x + 7.5*self.attackBlock.displayWidth/10, self.attackBlock.y + index * self.attackBlock.displayHeight / 4 + self.attackBlock.displayHeight/16, attack.requiredMps + " MP", 
				{ // puntos de mana
				font: '12px "Arial"',
				fontStyle: 'bold',
				color: colors[attack.type], // color en función de tipo
				align: 'left',
				}), srcAttack: attack } // setteamos el ataque base al ataque que queramos
			
			
			self.attackText[index].text.visible = false; // invisible
			self.attackText[index].mp.visible = false;

			self.attackText[index].text.setInteractive(); // hacemos que sea interactuable
			self.CreateAttackButton(self.attackText[index]); // creamos el botón de ataque
		});
	}
	i=0; // RAÚL explícame esto por fa
	CreateAttackButton(attackText){ // creamos los botones de ataque
		attackText.text.on('pointerover', () => { // puntero encima
			if(this.scene.allies[this.scene.currentAlly].CanAttack(attackText.srcAttack)){
				this.scene.cursor=true; //···RAUL PRUEBAS···
			this.scene.pointer.visible = true;
			this.scene.pointer.x = attackText.text.x-15;
			this.scene.pointer.angle = 0;
			this.scene.pointer.y = attackText.text.y+attackText.text.displayHeight/2;
			this.scene.pointer.setScale(1);
			
			//···RAUL PRUEBAS···
			while(this.i<4)
			{
				if(this.attackText[this.i]===attackText) this.scene.attack=this.i;
				this.i++;
			}
			}
		});
		attackText.text.on('pointerup', () => { // hemos pulsado el botón
			if(this.scene.allies[this.scene.currentAlly].CanAttack(attackText.srcAttack)){
				this.scene.selectedAttack = attackText.srcAttack;
				if(attackText.srcAttack.isSupport())
				{
					//···RAUL PRUEBAS···
					this.scene.choseA=true;
					this.scene.cursor=false;
					this.scene.allaySelected=0;
				}
				else {
					//···RAUL PRUEBAS···
					this.scene.choseE=true;
					this.scene.cursor=false;
					this.scene.enemyselected=0;
				}
				this.scene.RequestChangeState();
				this.DisplayAttacks(false);
				this.scene.pointer.visible = true;//···RAUL PRUEBAS···
				this.scene.combat=false;//···RAUL PRUEBAS···
				
			}
		})
		attackText.text.on('pointerout', () =>{ // hemos qutiado el botón
			this.scene.cursor=false;
			this.i=0;
		})
	}

	// mostrar ataques
	DisplayAttacks(hideObjects){
		this.attackBlock.visible = !this.attackBlock.visible; // este método sirve para mostrar y esconder ataques
		this.attackText.forEach(function (attack){
			attack.text.visible = !attack.text.visible;
			attack.mp.visible = !attack.mp.visible;
		});
		if(hideObjects) this.scene.ToggleObjectButtons(!this.attackBlock.visible); // desactivamos / activamos botones
			//···RAUL PRUEBAS···
		// updateamos cosas para el uso del ratón en combate
		if(!this.scene.combat)
		{
			this.scene.combat=true;
			this.scene.pointer.visible=true;
			this.scene.attack=0;
		}
		else
		{
			this.scene.combat=false;
			this.scene.pointer.visible=false;
			this.scene.attack=-1;
		}
	}
	
	// actualizamos las barras
	Update(){
		this.HealthBar.Update(this.character.actualHp);
		this.ManaBar.Update(this.character.actualMp);
	}
}

export class QuestHUD{
	constructor(scene){
		this.scene = scene;
		this.questLog = allyParty.questLog;
		this.scale = 3;
		this.questBlock = scene.add.image(20, 20, 'miniHUD').setOrigin(0,0);
		this.questBlock.setScale(this.scale, this.scale / 2);
		this.questBlock.depth = 4;

		this.questName = scene.add.text(40, 35, "",{
			font: 'Arial"',
			color: '#ffffff',
			align: 'left',});
		this.questName.setFontSize(20);
		this.questName.depth = 4;

		this.text = scene.make.text({
			x: 40, y: 60,
			text: "",
			style: {
				wordWrap: {width: 350},
				font: '20px Arial',
				color: '#ffffff',
				align: 'left'
			}});

		this.text.setFontSize(20);
		this.text.depth = 4;

		let offset = 35;
		this.upArrowParty = this.scene.add.image(this.questBlock.width * this.scale + offset, this.questBlock.height * this.scale / 2 - offset , 'logButton').setScale(this.scale / 2);
		this.downArrowParty = this.scene.add.image(0, 0, 'logButton').setScale(this.scale / 2);
		this.downArrowParty.x = this.upArrowParty.x;
		this.downArrowParty.y = this.upArrowParty.y + this.upArrowParty.height * 3 / 2; 
		this.downArrowParty.angle = 180;
		this.upArrowParty.depth = 4;
		this.downArrowParty.depth = 4;
		this.AddButtons();
	}

	Update(){
		let aux = this.questLog.ShowQuest();
		if(aux.name !== undefined){
			this.questName.text = "Misión: " + aux.name;
			this.text.setText("-" +aux.text);
		}
		else{
			this.questName.text = "";
			this.text.setText(aux.text);
		}
		if(aux.yellowColor) this.text.setStyle({
			font: 'Arial"',
			color: '#ffff00',
			align: 'left',});

		else this.text.setStyle({
			font: 'Arial"',
			color: '#ffffff',
			align: 'left',});
		this.text.setFontSize(20);
	}

	AddButtons(){
		this.upArrowParty.setInteractive();
		this.downArrowParty.setInteractive();

		let self = this;
		this.upArrowParty.on("pointerup", function(){ 
			if(0 < self.questLog.actualQuest){
				self.questLog.actualQuest--;
				self.Update();
			}
		});

		this.downArrowParty.on("pointerup", function(){
			if(self.questLog.quests.length - 1 !== self.questLog.actualQuest && 0 <= self.questLog.actualQuest){
				self.questLog.actualQuest++;
				self.Update();
			}
		});
	}

	Hide(bool){
		this.upArrowParty.visible = !bool;
		this.downArrowParty.visible = !bool;
		this.questName.visible = !bool;
		this.questBlock.visible = !bool;
		this.text.visible = !bool;
	}
	
}

export class InventoryHUD{
	constructor(scene, inv, x, y){
		this.inventoryBlock = scene.add.image(x, y, 'attackBlock').setOrigin(0,0);
		this.inventoryBlock.setScale(1.5,1);
		this.inventoryBlock.visible = false;

		this.initialItem = 0;
		this.finalItem = 3;

		this.inventory = inv;
		this.scene = scene;

		this.CreateItems(scene)
	}

	CreateItems(scene){
		this.itemsText = [];
		let self = this;
		this.inventory.inv.forEach(function(item, index){
			self.itemsText[index] = {
				text: scene.add.text(self.inventoryBlock.x + self.inventoryBlock.displayWidth / 14, self.inventoryBlock.y + index * self.inventoryBlock.displayHeight / 4 + self.inventoryBlock.displayHeight / 16, item.name,
				{
					font: '12px "Press Start 2P"',
					color: '#ffffff',
					align: 'left',}),
				
				quantity: scene.add.text(self.inventoryBlock.x + 7.5 * self.inventoryBlock.displayWidth / 10, self.inventoryBlock.y + index * self.inventoryBlock.displayHeight / 4 + self.inventoryBlock.displayHeight / 16, item.quantity,
				{
					font: '12px "Press Start 2P"',
					color: '#ffffff',
					align: 'left',})}

			self.itemsText[index].text.visible = false;
			self.itemsText[index].quantity.visible = false;

			self.itemsText[index].text.setInteractive();
		});
		if(this.inventory.inv.length < 4) this.finalItem = this.inventory.inv.length - 1;
	}

	DisplayItems(){
		let i = 0;
		this.inventoryBlock.visible = !this.inventoryBlock.visible;
		for(i = this.initialItem; i <= this.finalItem; i++){
			this.itemsText[i].text.x = this.inventoryBlock.x + this.inventoryBlock.displayWidth / 14;
			this.itemsText[i].text.y = this.inventoryBlock.y + (i - this.initialItem) * this.inventoryBlock.displayHeight/4 + this.inventoryBlock.displayHeight / 16;
			this.itemsText[i].quantity.x = this.inventoryBlock.x + 7.5 * this.inventoryBlock.displayWidth / 10;
			this.itemsText[i].quantity.y = this.inventoryBlock.y + (i - this.initialItem) * this.inventoryBlock.displayHeight / 4 + this.inventoryBlock.displayHeight / 16
			this.itemsText[i].text.visible = this.inventoryBlock.visible;
			this.itemsText[i].quantity.visible = this.inventoryBlock.visible;
			this.ItemButtom(this.itemsText[i], i)
		}
	}

	// vamos hacia arriba
	Up(){
		if(this.initialItem !== 0){
			this.DisplayItems();
			this.initialItem--;
			this.finalItem--;
			this.DisplayItems();
		}
	}

	// vamos hacia abajo
	Down(){
		if(this.finalItem < this.itemsText.length - 1){
			this.DisplayItems();
			this.initialItem++;
			this.finalItem++;
			this.DisplayItems();
		}
	}

	//Le damos funcionalidad a cada objeto del inventario
	ItemButtom(itemText, index){
		let self = this;
		itemText.text.on('pointerup', () =>{ //Cuando se pulsa:
			self.scene.selectedItem = self.inventory.inv[index]; //Se selecciona el objeto que queremos usar
			self.scene.inventoryUp.visible = !self.scene.inventoryUp.visible //Hacemos invisible las flechas de navegación 
			self.scene.inventoryDown.visible = !self.scene.inventoryDown.visible //del inventario
			self.DisplayItems(); //Quitamos el inventario
			self.scene.RequestChangeState(true); //Se cambia el estado de combate al uso de objetos
		})
	}

	//Se cambia el inventario en caso de que haya sido usado
	UpdateItem(inv){
		this.inventory = inv;
		this.CreateItems(this.scene);
	}
}

export class shopHUD{
	constructor(scene, items, npc){
		this.scene = scene;
		this.shopBlock = this.scene.add.image(this.scene.sys.game.canvas.width / 2, this.scene.sys.game.canvas.height / 2, 'log');
		this.moneyBlock = this.scene.add.image(this.shopBlock.x - this.shopBlock.displayWidth / 2, this.shopBlock.y - 100, 'log').setScale(0.5);
		this.moneyText = this.scene.add.text(this.moneyBlock.x - this.moneyBlock.displayWidth / 2.5, this.moneyBlock.y - this.moneyBlock.displayHeight /5, 
		"Dinero: " + allyParty.inventory.money, {font: '20px "Arial"'});
		this.shopBlock.setScale(1.5);
		this.shopBlock.depth = 4;
		this.moneyBlock.depth = 4;
		this.moneyText.depth = 4;
		this.moneyBlock.visible = false;
		this.moneyText.visible = false;
		this.shopBlock.visible = false;

		this.npc = npc

		this.currentItem = 0;
		this.items = items;
		this.createItems();
		this.createButtons();
	}

	createButtons(){
		this.buyButton = this.scene.add.image(this.shopBlock.x - this.shopBlock.displayWidth/2 + this.moneyBlock.displayWidth*1.3, this.shopBlock.y - this.shopBlock.displayHeight/2 - this.moneyBlock.displayHeight / 2 + 3, 'buy'); //Botón de comprar
		this.buyButton.setScale(1.5);
		this.buyButton.depth = 4;
		this.buyButton.setInteractive();
		this.buyButton.visible = false;

		this.naoButton = this.scene.add.image(this.buyButton.x + this.buyButton.displayWidth - 5, this.buyButton.y, 'noBuy'); //Botón de no comprar
		this.naoButton.setScale(1.5);
		this.naoButton.depth = 4;
		this.naoButton.setInteractive();
		this.naoButton.visible = false;

		this.upButton = this.scene.add.image(this.shopBlock.x + this.shopBlock.displayWidth / 2 + 1,  this.shopBlock.y - this.shopBlock.displayHeight / 2, 'logButton');
		this.upButton.setScale(1.5);
		this.upButton.depth = 4;
		this.upButton.setInteractive();
		this.upButton.visible = false;

		this.downButton = this.scene.add.image(this.shopBlock.x + this.shopBlock.displayWidth / 2 + 1, this.upButton.y + this.upButton.displayHeight, 'logButton');
		this.downButton.setScale(1.5);
		this.downButton.depth = 4;
		this.downButton.angle = 180;
		this.downButton.setInteractive();
		this.downButton.visible = false;

		this.buyItem = this.scene.add.image(this.shopBlock.x + this.shopBlock.displayWidth / 4, this.shopBlock.y + this.shopBlock.displayHeight / 2, 'buyItem').setScale(2).setOrigin(0,0);
		this.buyItem.depth = 4;
		this.buyItem.setInteractive();
		this.buyItem.visible = false;

		let self = this;

		this.buyItem.on('pointerup', () => {
			self.npc.buy(self.items[self.currentItem]);
			self.moneyText.setText("Dinero: " + allyParty.inventory.money);
		});

		this.buyButton.on('pointerup', () => {
			self.moneyText.setText("Dinero: " + allyParty.inventory.money);
			self.displayItems();
		});

		this.naoButton.on('pointerup', () => {
			if(self.shopBlock.visible)
				self.displayItems();
			self.naoButton.visible = false;
			self.buyButton.visible = false;
			self.npc.close();
		})

		this.upButton.on('pointerup', () => {
			self.Up();
		})

		this.downButton.on('pointerup', () => {
			self.Down();
		})
	}

	createItems(){
		this.itemsText = [];
		let self = this;
		this.items.forEach(function(item, index){
			self.itemsText[index] = {
				name: self.scene.add.text(self.shopBlock.x - 6 * self.shopBlock.displayWidth / 14, self.shopBlock.y - 7 * self.shopBlock.displayHeight / 16 + 5, item.name,
				{
					font: '20px "Arial"',
					color: '#ffffff',
					align: 'left',}),
				price: self.scene.add.text(self.shopBlock.x + 2.5 * self.shopBlock.displayWidth / 10, self.shopBlock.y - 7 * self.shopBlock.displayHeight / 16 + 5, item.price + ' euro(s)',
				{
					font: '20px "Arial"',
					color: '#ffffff',
					align: 'left',}),
				hp: self.scene.add.text(self.shopBlock.x - 6 * self.shopBlock.displayWidth / 14, self.shopBlock.y - 3 * self.shopBlock.displayHeight / 16 + 5, item.hp + ' hp',
				{
					font: '20px "Arial"',
					color: '#ffffff',
					align: 'left',}),
				mp: self.scene.add.text(self.shopBlock.x + 2.5 * self.shopBlock.displayWidth / 10, self.shopBlock.y - 3 * self.shopBlock.displayHeight / 16 + 5, item.mp + ' mp',
				{
					font: '20px "Arial"',
					color: '#ffffff',
					align: 'left',}),
				image: self.scene.add.image(self.shopBlock.x, self.shopBlock.y, item.imgID).setScale(4)
			}

			self.itemsText[index].name.depth = 4;
			self.itemsText[index].price.depth = 4;
			self.itemsText[index].hp.depth = 4;
			self.itemsText[index].mp.depth = 4;
			self.itemsText[index].image.depth = 4;

			self.itemsText[index].name.visible = false;
			self.itemsText[index].price.visible = false;
			self.itemsText[index].hp.visible = false;
			self.itemsText[index].mp.visible = false;
			self.itemsText[index].image.visible = false;

			self.itemsText[index].name.setInteractive();

		});
	}

	displayItems(){
		this.buyItem.visible = !this.buyItem.visible; 
		this.moneyText.visible = !this.moneyText.visible;
		this.moneyBlock.visible = !this.moneyBlock.visible;
		this.upButton.visible = !this.upButton.visible;
		this.downButton.visible = !this.downButton.visible;
		this.shopBlock.visible = !this.shopBlock.visible;
		this.itemsText[this.currentItem].visible = !this.itemsText[this.currentItem].visible;
		this.itemsText[this.currentItem].name.visible = !this.itemsText[this.currentItem].name.visible;
		this.itemsText[this.currentItem].price.visible = !this.itemsText[this.currentItem].price.visible;
		this.itemsText[this.currentItem].hp.visible = !this.itemsText[this.currentItem].hp.visible;
		this.itemsText[this.currentItem].mp.visible = !this.itemsText[this.currentItem].mp.visible;
		this.itemsText[this.currentItem].image.visible = !this.itemsText[this.currentItem].image.visible;
	}

	Down(){
		if(this.currentItem < this.items.length - 1){
			this.displayItems();
			this.currentItem++;
			this.displayItems();
		}
	}

	Up(){
		if(this.currentItem !== 0){
			this.displayItems();
			this.currentItem--;
			this.displayItems();
		}
	}
}

// ENEMIGOS EN COMBATE
export class EnemyHUD{
	constructor(scene, character)
	{
		this.character = character; // referencia al enemigo
		// barra de vida con texto
		this.healthBar = new HealthBar(scene,this.character.x-this.character.displayWidth/1.5, this.character.y + this.character.displayHeight*2.1,this.character.displayWidth*1.8, 'HP', this.character.actualHp, this.character.maxHp);
	}
	
	// actualizamos la barra de vida
	Update(){
		this.healthBar.Update(this.character.actualHp);
		// cambiarle la pos
	}
}

// BARRAS DE VIDA / MANÁ
class HealthBar {

	constructor (scene, x, y, width, type, initialValue, maxValue, hasText = true, height = 10)
	{
		this.bar = new Phaser.GameObjects.Graphics(scene); // Generamos el tipo de objeto
		// posición
		this.x = x;
		this.y = y;
		this.value = initialValue; // valor incial
		this.renderDiff = 0.5;
		this.renderingValue = initialValue;
		this.increase = 0; // 1 suma, 0 nada, -1 resta
		this.width = width; // ancho
		this.type = type; // tipo: VIDA / MANÁ
		this.maxValue = maxValue; // valor máximo
		this.height = height; // altura
		scene.add.existing(this.bar); // añadimos la barra a la escena
		this.hasText = hasText; // tiene texto?
		this.bar.depth = 3;
		if(this.hasText){ // si lo tiene, se crea
			this.texto = scene.add.text(x + this.width/3.2, y + this.height, this.value + ' / '+maxValue + ' ' + type, { font: '"Arial"' });
			this.texto.depth = 7;
			this.bar.depth = 7;
		}
		this.hidden;
		this.draw(); // dibujamos la barra en la escena
	}

	// actualizamos la barra
	Update(newValue, bool = true){
		this.updateValue(newValue); // actualizamos su valor
		this.draw(bool); // dibujado
	}

	// actualización de valor (método "interno")
	updateValue(newValue){
		this.value = Math.floor(newValue);
	}

	// ocultar barra
	hide(bool){
		this.hidden = bool;
		this.draw();
	}

	// cambio de posición
	setPos(x,y){
		this.x = x;
		this.y = y;
		if(this.texto !== undefined){
			this.texto.x = x + this.width/3.2;		
			this.texto.y = y + this.height;		
		}
		this.draw()
	}

	// dibujado
	draw (bool = true)
	{
		this.bar.clear(); // limpiamos la barra
		if(this.hasText) this.texto.visible = !this.hidden;
		if(!this.hidden){
			// si tiene texto...
			if(this.hasText){ this.texto.setText(this.value + ' / '+this.maxValue + ' ' + this.type); }
			
			//  fondo
			this.bar.fillStyle(0x000000);
			this.bar.fillRect(this.x, this.y, this.width, this.height);
			//  fill
			if (this.value < 30 && this.type == 'HP') // en rojo si está a poca vida
			{
				this.bar.fillStyle(0xff0000);
			}
			else // color base con más vida
			{
				if(this.type == 'HP') this.bar.fillStyle(0x00ff00);
				else this.bar.fillStyle(0x0000ff);
			}
	
			if(bool){
				let keepDrawing = this.keepDrawing();
				if(keepDrawing.changing && this.renderingValue > 0) {        // La barra de vida puede ser negativa por el renderingvalue, retocar esto
					if(keepDrawing.decrease) this.renderingValue -= this.renderDiff;
					else this.renderingValue += this.renderDiff;
				}
	
				let barWidth = (this.renderingValue*this.width) / this.maxValue; // ancho
		
				this.bar.fillRect(this.x + 2, this.y + 2, barWidth - 4, this.height - 4); // dibujado
			}
			else{
				let barWidth = (this.value*this.width) / this.maxValue; // ancho
		
				this.bar.fillRect(this.x + 2, this.y + 2, barWidth - 4, this.height - 4); // dibujado
			}
		}
	}

	keepDrawing()
	{
		if(this.renderingValue > this.value) return { changing: true, decrease: true };
		else if (this.renderingValue < this.value) return { changing: true, decrease: false };
		else return { changing: false, decrease: false };
	}
}

var colors = ['#cccccc','#aaaaaa','#ff0000','#00ffff','#ff00ff','#00ff00'];

// MODO EXPLORACIÓN 
export class walkingHUD {
	constructor(x,y,scene,img){
		this.x = x; // posición
		this.y = y;
		this.scene = scene; // escena
		this.imgID = img; // id imagen
		this.bgIMG = this.scene.add.image(this.x, this.y, this.imgID).setOrigin(0,0); // imagen como tal
		this.bgIMG.setScale(0.4 * allyParty.party.length,1) // setteamos la escala en función del tamaño de la party
		this.characters = []; // array de objetos de información
		this.GenerateImages(); // generamos las imágenes de cada bichito
		this.imagesToSwap = [];
	}

	charInfo(){
		return {image: "", health: "", mana: ""};	// objeto de información del HUD
	}

	swapAllies(index){
		this.imagesToSwap.push(index);
		if(this.imagesToSwap.length > 1){
			[this.characters[this.imagesToSwap[0]].image.x,this.characters[this.imagesToSwap[1]].image.x] = 
			[this.characters[this.imagesToSwap[1]].image.x,this.characters[this.imagesToSwap[0]].image.x];
			
			let newPos1 = this.characters[this.imagesToSwap[0]].health.x;
			let newPos2 = this.characters[this.imagesToSwap[1]].health.x;
			
			let newPos3 = this.characters[this.imagesToSwap[0]].mana.x;
			let newPos4 = this.characters[this.imagesToSwap[1]].mana.x;
			
			this.characters[this.imagesToSwap[0]].health.setPos(newPos2, this.characters[this.imagesToSwap[0]].health.y);
			this.characters[this.imagesToSwap[1]].health.setPos(newPos1, this.characters[this.imagesToSwap[1]].health.y);
			
			this.characters[this.imagesToSwap[0]].mana.setPos(newPos4, this.characters[this.imagesToSwap[0]].mana.y);
			this.characters[this.imagesToSwap[1]].mana.setPos(newPos3, this.characters[this.imagesToSwap[1]].mana.y);

			[this.characters[this.imagesToSwap[0]].index,this.characters[this.imagesToSwap[1]].index] = 
			[this.characters[this.imagesToSwap[1]].index,this.characters[this.imagesToSwap[0]].index];

			[this.characters[this.imagesToSwap[0]],this.characters[this.imagesToSwap[1]]] = 
			[this.characters[this.imagesToSwap[1]],this.characters[this.imagesToSwap[0]]];

			this.imagesToSwap = [];
		}
	}

	GenerateImages(){
		let self = this; // guardamos referencia al this
		allyParty.party.forEach(function(ally, index){ // recorremos toda la party
			self.characters[index] = self.charInfo(); // metemos un nuevo objeto de info al array de info
			let offset = 28; // offset que cuadra bien 
			let x = self.x+ offset + index * 50; // x para las imágenes
			let barX = x - offset/2; // x para las barras
			self.characters[index].image = self.scene.add.image(x, self.y + 25, ally.imgID + 'Head'); // generar imagen
			self.characters[index].image.setScale(2); // escalarla
			// generar barras de vida
			// usamos la allyParty para acceder a los valores de vida de cada PJ
			self.characters[index].health = new HealthBar(self.scene,barX,self.y + 35,30,"HP",ally.actualHp, ally.maxHp, false);
			self.characters[index].mana = new HealthBar(self.scene,barX,self.y + 45,30,"MP",ally.actualMp, ally.maxMp, false);
			self.characters[index].name = ally.name;
			self.characters[index].index = index;
		});
	}

	// actualización de valores
	Update(){
		// guardamos referencia al this
		let self = this;
		allyParty.party.forEach(function(ally, index){ // recorremos toda la party

			self.characters[index].health.renderingValue = ally.actualHp;
			self.characters[index].mana.renderingValue = ally.actualMp;

			self.characters[index].health.Update(ally.actualHp); 
			self.characters[index].mana.Update(ally.actualMp);
		});
	}

	// esconder menú
	Hide(bool){
		let self = this;
		this.characters.forEach(function(char){
			char.image.visible = !bool;
			char.health.hide(bool);
			char.mana.hide(bool);
			self.bgIMG.visible = !bool;
		});
	}
}

// enumerador de tipos de ataque
const typeOfAttack = {
	0: "Físco",
	1: "Rango",
	2: "Fuego",
	3: "Eléctrico",
	4: "Tóxico",
	5: "Apoyo"
};


export class ChooseDev{
	constructor(x,y,scene){
		this.scale = 1.5;
		this.x = x;
		this.y = y;
		this.scene = scene;
		this.bImage = this.scene.add.image(x,y,'devsBg').setOrigin(0,0).setScale(4);
		this.AddButtons();
	}

	AddButtons(){
		let self = this;
		this.devs = [];
		this.devs.push(this.scene.add.image(this.x+ 20,this.y+ 100, 'roi').setOrigin(0,0).setScale(2));
		this.devs.push(this.scene.add.image(this.x+ 90,this.y+ 100, 'raul').setOrigin(0,0).setScale(2));
		this.devs.push(this.scene.add.image(this.x +160,this.y+ 100, 'pablo').setOrigin(0,0).setScale(2));
		this.devs.push(this.scene.add.image(this.x + 230,this.y+ 100, 'alex').setOrigin(0,0).setScale(2));
		this.devs.push(this.scene.add.image(this.x + 300,this.y+ 100, 'david').setOrigin(0,0).setScale(2));

		let i = 0;
		for(let e of this.devs){
			let index = i;
			e.setInteractive();
			e.on("pointerup", function() {
				console.log(index, EnviromentInfo.character[index]);
				allyParty.Add(EnviromentInfo.character[index]);
				self.bImage.destroy();
				self.devs[0].destroy();
				self.devs[1].destroy();
				self.devs[2].destroy();
				self.devs[3].destroy();
				self.devs[4].destroy();
				self.scene.scene.get('hud').Reset();
			});
			i++;
		}		
	}
}

export class ExploreMenu {
	constructor(x,y,scene, imgID, pointer, walkingHUD){
		this.scale = 1.5;
		this.blockSize = 98;
		this.attOffset = 20;
		this.attOffsetBetween = 30;
		this.attHoverOffset = 15;
		this.resOffset = 90;  
		this.x = x; // posición
        this.y = y;
        this.scene = scene; // escena
		this.imgID = imgID; // imagen
		this.bImage = this.scene.add.image(x,y,imgID).setOrigin(0,0);
		this.bImage.setScale(this.scale);
		this.bImage.depth = 5;
		this.pointer = pointer;
		this.alliesShownIndex = 0;
		this.AddPartyMenu(); // añadir el submenú de la party
		this.AddPartyManagementMenu();
		this.AddItemsMenu();
		this.AddQuestMenu();
		this.AddButtons(); // añadir botones para los submenús
		this.backButton; // salir del menú actual
		this.currentMenu; // variable que ayude al backButton a gestionar la salida de los menús
		this.objectButton;
		this.alliesToSwap = [];
		this.walingHUD = walkingHUD;
		this.viewParty = false;
		this.manageParty = false;
		this.viewItems = false;
	}

	AddPartyManagementMenu(){
		let x = 0;
		let y = 2;
		let self = this;
		this.managerImages = [];
		allyParty.party.forEach(function(ally, index){
			// declaración de variables
			let images = self.managerImages[index];
			let newX = x+self.blockSize * self.scale * (index % 4), newY = y + self.blockSize/2*self.scale;
			if(index >= allyParty.alliesNum){
				newY += (self.blockSize *self.scale * (~~(index/4)));
			}
			images = {bgIMG: self.scene.add.image(newX,newY - self.blockSize/2*self.scale,'partyStateBG').setOrigin(0,0).setScale(self.scale), 
						charIMG: self.scene.add.image(newX + self.blockSize/2 * self.scale,newY,ally.imgID).setScale(2*self.scale),
						index: index};				
			images.bgIMG.depth = 7;
			images.charIMG.depth = 8;
			images.bgIMG.visible = false;
			images.charIMG.visible = false;
			self.managerImages.push(images);
		})
	}

	SwapAllies(ally){
		this.alliesToSwap.push(ally); // acordarse de borrar el array cuando quites el menú
		if(this.alliesToSwap.length > 1){
			[this.alliesToSwap[0].charIMG,this.alliesToSwap[1].charIMG] = 
			[this.alliesToSwap[1].charIMG,this.alliesToSwap[0].charIMG];

			[this.alliesToSwap[0].charIMG.x,this.alliesToSwap[1].charIMG.x] =
			[this.alliesToSwap[1].charIMG.x,this.alliesToSwap[0].charIMG.x];

			[this.alliesToSwap[0].charIMG.y,this.alliesToSwap[1].charIMG.y] =
			[this.alliesToSwap[1].charIMG.y,this.alliesToSwap[0].charIMG.y];

			[this.alliesToSwap[0].index, this.alliesToSwap[1].index] =
			[this.alliesToSwap[1].index, this.alliesToSwap[0].index];

			this.alliesToSwap = [];
		}
	}

	// usado solo para crear los botones
	AddButtons(){
		let buttonX = this.x + 20;
		let buttonY = this.y + 60;
		//#region MAIN MENU BUTTONS
		// PARTY STATE BUTTONS
		this.viewPartyButton = this.scene.add.image(buttonX, buttonY, 'menuPartyButton').setOrigin(0,0); // botón para ver el estado de la party
		this.viewPartyButton.setInteractive();
		this.viewPartyButton.setScale(this.scale);
		this.viewPartyButton.depth = 6;
		this.pointer.depth = 6;
		let self = this;
		this.viewPartyButton.on("pointerup", function(){
			self.viewParty = !self.viewParty;
			self.viewItems = false;
			self.viewQuests = false;
			self.manageParty = false;
			self.ShowItems(self.viewItems);
			self.ManageParty(self.manageParty);
			self.ShowQuests(self.viewQuests);
			self.ShowParty(self.viewParty);
		});

		this.viewPartyButton.on("pointerover", function(){
			self.pointer.x = buttonX - self.viewPartyButton.displayWidth / 6;
			self.pointer.y = buttonY + self.viewPartyButton.displayHeight / 3;
			self.pointer.visible = true;
		});
		
		this.viewPartyButton.on("pointerout", function(){
			self.pointer.visible = false;
		});

		this.upArrowParty.on("pointerup", function(){
			if(self.alliesShownIndex > 0 && self.alliesShownIndex <= self.partyImages.length - 4){
				self.alliesShownIndex--;
				self.ShowParty(true);
			}
		});

		this.downArrowParty.on("pointerup", function(){
			if(self.alliesShownIndex >= 0 && self.alliesShownIndex < self.partyImages.length - 4){
				self.alliesShownIndex++;
				self.ShowParty(true);
			}
		});

		// PARTY MANAGER BUTTON
		this.managePartyButton = this.scene.add.image(buttonX, buttonY + 60, 'menuOrderButton').setOrigin(0,0).setInteractive().setScale(this.scale);
		this.managePartyButton.depth = 6;
		this.managePartyButton.visible = false;
		this.managePartyButton.on("pointerup", function(){
			self.manageParty = !self.manageParty;
			self.viewParty = false;
			self.viewItems = false;
			self.viewQuests = false;
			self.ShowItems(self.viewItems);
			self.ManageParty(self.manageParty);
			self.ShowQuests(self.viewQuests);
			self.ShowParty(self.viewParty);
		});
		this.managePartyButton.on("pointerover", function(){
			self.pointer.x = buttonX - self.managePartyButton.displayWidth / 6;
			self.pointer.y = buttonY +60 + self.managePartyButton.displayHeight / 3;
			self.pointer.visible = true;
		});
		this.managePartyButton.on("pointerout", function(){
			self.pointer.visible = false;
		});

		// INVENTORY 
		this.itemButton = this.scene.add.image(buttonX, buttonY + 120, 'showItem').setOrigin(0,0).setInteractive().setScale(this.scale);
		this.itemButton.depth = 6;
		this.itemButton.visible = false;
		this.itemButton.on("pointerup", function(){
			self.viewItems = !self.viewItems;
			self.viewParty = false;
			self.viewQuests = false;
			self.manageParty = false;
			self.ShowItems(self.viewItems);
			self.ManageParty(self.manageParty);
			self.ShowQuests(self.viewQuests);
			self.ShowParty(self.viewParty);
		});
		this.itemButton.on("pointerover", function() {
			self.pointer.x = buttonX - self.itemButton.displayWidth / 6;
			self.pointer.y = buttonY + 120 + self.itemButton.displayHeight / 3;
			self.pointer.visible = true;
		});
		this.itemButton.on("pointerout", function(){
			self.pointer.visible = false;
		});

		// QUESTS
		this.questButton = this.scene.add.image(buttonX, buttonY + 180, 'showQuests').setOrigin(0,0).setInteractive().setScale(this.scale);
		this.questButton.depth = 6;
		this.questButton.visible = false;
		this.questButton.on("pointerup", function(){
			self.viewItems = false;
			self.viewParty = false;
			self.manageParty = false;
			self.viewQuests = !self.viewQuests;
			self.ShowItems(self.viewItems);
			self.ManageParty(self.manageParty);
			self.ShowParty(self.viewParty);
			self.ShowQuests(self.viewQuests);
		});
		this.questButton.on("pointerover", function() {
			self.pointer.x = buttonX - self.questButton.displayWidth / 6;
			self.pointer.y = buttonY + 180 + self.questButton.displayHeight / 3;
			self.pointer.visible = true;
		});
		this.questButton.on("pointerout", function(){
			self.pointer.visible = false;
		});

		//#endregion

		//#region PARTY MENU BUTTONS
		
		//#endregion
		//#region MANAGE PARTY MENU BUTTONS
		this.managerImages.forEach(function(image, index){
			image.bgIMG.setInteractive();
			image.bgIMG.on("pointerup", function(){
				self.walingHUD.swapAllies(index);
				self.SwapAllies(image);
			})
		});

		//#endregion
	}
	// devuelve un objeto con dos imágenes dadas (usado en AddPartyMenu)
	imageInfo(char, bg, statsBG){
		return {charIMG: bg, bImage: char, statIMG: statsBG, stats:{
			hp: 100,
			maxHp: 100,
            mp: 100,
			maxMp: 100,
			attacks: [],
			resistances: [],
			acurracy: 95,
			speed: 50,
			resP: 0,resR: 0,resE: 0,resF: 0,resT: 0
		} };
	}
	
	ShowQuests(bool){
		this.viewQuets = bool;
		if(this.questImages.length !== 0){
			this.questImages[this.questToShow].img.visible = bool;
			this.questImages[this.questToShow].npcName.visible = bool;
			this.questImages[this.questToShow].desc.visible = bool;
			let i = 0;
			for(let e of this.questTexts){
				if (bool && i >= this.questTextToShow && i < this.questTextToShow + 4){
					e.visible = true;
					e.y = this.bChooseQuest.y + 20 + (i - this.questTextToShow)*30;
					e.setInteractive();
				}
				else{
					e.visible = false;
					e.disableInteractive();
				}
				i++;
			}
		}
		if(bool){
			this.upArrowQuest.setInteractive();
			this.downArrowQuest.setInteractive();
		}
		else{
			this.upArrowQuest.disableInteractive();
			this.downArrowQuest.disableInteractive();
		}
		this.upArrowQuest.visible = bool;
		this.downArrowQuest.visible = bool;
		this.bQuest.visible = bool;
		this.bChooseQuest.visible = bool;
	}

	// usado solo para crear el menú de la party	
	AddPartyMenu(){
		let x = 0;
		let y = 2;
		this.partyImages = [];
		let self = this;
		allyParty.party.forEach(function(ally, index){
			// declaración de variables
			let newY = y+self.blockSize * self.scale *index;
			let images = self.partyImages[index];
			
			// imágenes de fondo
			images = self.imageInfo(self.scene.add.image(x,newY,'partyStateBG').setOrigin(0,0),
			self.scene.add.image(x + self.blockSize/2*self.scale, newY + self.blockSize/2*self.scale, ally.imgID), self.scene.add.image(x + self.blockSize * self.scale, newY, 'partyStats').setOrigin(0,0));

			// cambiar escala
			images.bImage.setScale(self.scale);
			images.charIMG.setScale(self.scale*2);
			images.statIMG.setScale(0.72,1);
			images.partyX = x;
			images.partyY = newY;
			
			// generación de textos
			let resOffset = 63;
			let resOffset1 = 35;
			let res = ally.rP + "  " + ally.rR + "  "+ ally.rE + "  " + ally.rF + "  " + ally.rT;
			images.stats.rP = self.scene.add.image(x+ self.blockSize*self.scale + resOffset, newY +self.resOffset, 'resP');
			images.stats.rR = self.scene.add.image(x+ self.blockSize*self.scale + resOffset + resOffset1, newY +self.resOffset, 'resR');
			images.stats.rE = self.scene.add.image(x+ self.blockSize*self.scale + resOffset + resOffset1 * 2, newY +self.resOffset, 'resE');
			images.stats.rF = self.scene.add.image(x+ self.blockSize*self.scale + resOffset + resOffset1 * 3, newY +self.resOffset, 'resF');
			images.stats.rT = self.scene.add.image(x+ self.blockSize*self.scale + resOffset + resOffset1 * 4, newY +self.resOffset, 'resT');
			images.stats.resistances = self.scene.add.text(x+ self.blockSize*self.scale + self.blockSize/ 2, newY + 115, res,{font: "32px Arial"});
			images.stats.hp = new HealthBar(self.scene, x+self.blockSize*self.scale + self.blockSize/ 2, newY +10, 170, 'HP', ally.actualHp, ally.maxHp, true, 15);
			images.stats.mp = new HealthBar(self.scene, x+self.blockSize*self.scale + self.blockSize/ 2, newY +40, 170, 'MP', ally.actualMp, ally.maxMp, true, 15);

			images.stats.speed = ally.speed;
			images.stats.attacks[0] = self.scene.add.text(x + 2*self.blockSize * self.scale + self.blockSize, newY + self.attOffset, ally.attack[0].name +" "+ ally.attack[0].requiredMps+" MP",{font: "14px Arial", color: colors[ally.attack[0].type]} );
			images.stats.attacks[1] = self.scene.add.text(x + 2*self.blockSize * self.scale + self.blockSize, newY + self.attOffset + self.attOffsetBetween, ally.attack[1].name +" "+ ally.attack[1].requiredMps+" MP",{font: "14px Arial", color: colors[ally.attack[1].type]} );
			images.stats.attacks[2] = self.scene.add.text(x + 2*self.blockSize * self.scale + self.blockSize, newY + self.attOffset + self.attOffsetBetween * 2, ally.attack[2].name +" "+ ally.attack[2].requiredMps+" MP",{font: "14px Arial", color: colors[ally.attack[2].type]} );
			images.stats.attacks[3] = self.scene.add.text(x + 2*self.blockSize * self.scale + self.blockSize, newY + self.attOffset + self.attOffsetBetween * 3, ally.attack[3].name +" "+ ally.attack[3].requiredMps+" MP",{font: "14px Arial", color: colors[ally.attack[3].type]} );
			
			images.attackInfo = self.SetAttackInfo(images.stats.attacks, index, ally.attack);

			// cambio de depth
			images.stats.rP.depth = 7;
			images.stats.rR.depth = 7;
			images.stats.rE.depth = 7;
			images.stats.rF.depth = 7;
			images.stats.rT.depth = 7;
			images.charIMG.depth = 6;
			images.bImage.depth = 5;
			images.statIMG.depth = 5;
			images.stats.resistances.depth = 7;
			images.stats.hp.depth = 7;
			images.stats.attacks[0].depth = 7;
			images.stats.attacks[1].depth = 7;
			images.stats.attacks[2].depth = 7;
			images.stats.attacks[3].depth = 7;

			// invisible
			images.stats.rP.visible = false;
			images.stats.rR.visible = false;
			images.stats.rE.visible = false;
			images.stats.rF.visible = false;
			images.stats.rT.visible = false;
			images.bImage.visible = false;
			images.charIMG.visible = false;
			images.statIMG.visible = false;
			images.stats.resistances.visible = false;
			images.stats.hp.hide(true);
			images.stats.mp.hide(true);
			images.stats.attacks[0].visible = false;
			images.stats.attacks[1].visible = false;
			images.stats.attacks[2].visible = false;
			images.stats.attacks[3].visible = false;
			self.partyImages[index] = images;
		})
		this.upArrowParty = this.scene.add.image(650, 50, 'logButton').setScale(this.scale);
		this.downArrowParty = this.scene.add.image(650, 50 + this.upArrowParty.displayHeight, 'logButton').setScale(this.scale);
		this.downArrowParty.angle = 180;
		this.upArrowParty.visible = false;
		this.downArrowParty.visible = false;		
		this.upArrowParty.depth = 8;
		this.downArrowParty.depth = 8;
	}

	Update(){
		let self = this;
		allyParty.party.forEach(function (char){
			self.partyImages[char.initialIndex].stats.hp.Update(char.actualHp, false);
			self.partyImages[char.initialIndex].stats.mp.Update(char.actualMp, false);
		})
	}

	// Crear la información de los ataques
	SetAttackInfo(attacks, oldIndex, srcAttack){
		let attackInfo = [];
		let self = this;
		attacks.forEach(function(attack, index) {
			attack.setInteractive();
			let newIndex = (oldIndex +1)* (index+1) + index;
			let info = attackInfo[newIndex];
			let attType = "Tipo: " + typeOfAttack[srcAttack[index].type];
			let attDmg = srcAttack[index].dmg;
			if(attType === "Tipo: " + typeOfAttack[5]) attDmg = 'Cura: ' + (-attDmg);
			else attDmg = 'Daño: ' + attDmg;
			info = {
				bgIMG: self.scene.add.image(attack.x, attack.y, 'partyStateBG').setOrigin(0,0),
				type: self.scene.add.text(attack.x + self.attHoverOffset, attack.y + self.attHoverOffset, attType, {font: "12px Arial"}).setOrigin(0,0),
				dmg: self.scene.add.text(attack.x+self.attHoverOffset, attack.y + self.attHoverOffset * 2, attDmg, {font: "12px Arial"}).setOrigin(0,0),
				targets: self.scene.add.text(attack.x+self.attHoverOffset, attack.y + self.attHoverOffset * 3, 'Nº Obj.: ' + srcAttack[index].targets, {font: "12px Arial"}).setOrigin(0,0)
			};

			info.bgIMG.setScale(1.2,0.8);

			info.bgIMG.depth = 8;
			info.dmg.depth = 8;
			info.type.depth = 8;
			info.targets.depth = 8;

			info.bgIMG.visible = false;
			info.dmg.visible = false;
			info.type.visible = false;
			info.targets.visible = false;

			attack.on("pointerover", function (){
				info.bgIMG.visible = true;
				info.dmg.visible = true;
				info.type.visible = true;
				info.targets.visible = true;
			})
			attack.on("pointerout", function (){
				info.bgIMG.visible = false;
				info.dmg.visible = false;
				info.type.visible = false;
				info.targets.visible = false;
			})
			attackInfo[index] = info;
		});
		return attackInfo;
	}

	Show(bool){ // mostrar/ocultar el menú
		this.bImage.visible = bool;
		this.ToggleButtons(bool); // activar o desactivar botones
	}

	ToggleButtons(bool){ // activar o desactivar botones 
		if(!bool){
			this.viewPartyButton.disableInteractive();
			this.managePartyButton.disableInteractive();
			this.questButton.disableInteractive();
			this.itemButton.disableInteractive();
		} 
		else{
			this.viewPartyButton.setInteractive();
			this.itemButton.setInteractive();
			this.managePartyButton.setInteractive();
			this.questButton.setInteractive();
		}
		this.viewPartyButton.visible = bool;
		this.itemButton.visible = bool;
		this.managePartyButton.visible = bool;
		this.pointer.visible = false;
		this.questButton.visible = bool;
	}

	AddItemsMenu(){
		let self = this;
		this.itemToShow = 0;
		let x = 50;
		let y = 100;
		this.bItem = this.scene.add.image(x,y, 'menuBG').setOrigin(0,0).setScale(5, 1);
		this.bChooseItem = this.scene.add.image(x,y + this.bItem.displayHeight, 'menuBG').setOrigin(0,0).setScale(5, 0.5);
		this.bItem.visible = false;
		this.bChooseItem.visible = false;
		this.itemImages = [];
		this.itemTexts = [];
		this.upArrowItem = this.scene.add.image(this.bChooseItem.x + 4*this.bChooseItem.displayWidth/5,
												this.bChooseItem.y + 0.8*this.bChooseItem.displayHeight/3, 'logButton').setScale(3);
		this.downArrowItem = this.scene.add.image(this.bChooseItem.x + 4*this.bChooseItem.displayWidth/5,
												  this.bChooseItem.y + 2.2*this.bChooseItem.displayHeight/3, 'logButton').setScale(3);
		this.downArrowItem.angle = 180;
		this.upArrowItem.visible = false;
		this.downArrowItem.visible = false;
		this.itemTextToShow = 0;
		this.upArrowItem.on("pointerup", function(){
			if(self.itemTextToShow > 0){
				self.itemTextToShow--;
				self.ShowItems(true);
			}
		});
		this.downArrowItem.on("pointerup", function(){
			if(self.itemTextToShow + 4 <= self.itemTexts.length - 1){
				self.itemTextToShow++;
				self.ShowItems(true);
			}
		});

		for(let e of allyParty.inventory.inv){
			this.AddItem(e);
		}
	}

	AddQuestMenu(){
		let self = this;
		this.questToShow = 0;
		let x = 50;
		let y = 100;
		this.bQuest = this.scene.add.image(x,y, 'menuBG').setOrigin(0,0).setScale(5, 1);
		this.bChooseQuest = this.scene.add.image(x,y + this.bItem.displayHeight, 'menuBG').setOrigin(0,0).setScale(5, 0.5);
		this.bQuest.visible = false;
		this.bChooseQuest.visible = false;
		this.questImages = [];
		this.questTexts = [];
		this.upArrowQuest = this.scene.add.image(this.bChooseQuest.x + 4*this.bChooseQuest.displayWidth/5,
												this.bChooseQuest.y + 0.8*this.bChooseQuest.displayHeight/3, 'logButton').setScale(3);
		this.downArrowQuest = this.scene.add.image(this.bChooseQuest.x + 4*this.bChooseQuest.displayWidth/5,
												  this.bChooseQuest.y + 2.2*this.bChooseQuest.displayHeight/3, 'logButton').setScale(3);
		this.downArrowQuest.angle = 180;
		this.upArrowQuest.visible = false;
		this.downArrowQuest.visible = false;
		this.questTextToShow = 0;
		this.upArrowItem.on("pointerup", function(){
			if(self.questTextToShow > 0){
				self.questTextToShow--;
				self.ShowQuests(true);
			}
		});
		this.downArrowItem.on("pointerup", function(){
			if(self.questTextToShow + 4 <= self.questTexts.length - 1){
				self.questTextToShow++;
				self.ShowQuests(true);
			}
		});

		for(let e of allyParty.questLog.quests){
			this.AddQuest(e);
		}
	}

	AddQuest(quest){
		let self = this;
		let x = 100;
		let y = 110;
		let descripcion = quest.description;
		let image = this.scene.add.image(x,y,quest.img).setOrigin(0,0).setScale(4);
		let descX = x + image.displayWidth + 30;
		let descY = y + image.y - 70;
		let desc = this.scene.make.text({
            x : descX,
            y : descY,
            text : descripcion,
            style: {
				wordWrap : {width : 200},
				font: '20px "Arial"'
            },
        });
		desc.setText(descripcion);

		this.questImages.push({
			img: image,
			npcName: this.scene.add.text(x, y + 180, quest.npcName, {font: '20px "Arial"'}).setOrigin(0,0),
			desc: desc
		});
		let lastQuest = this.questImages.length - 1;
		this.questImages[lastQuest].img.visible = false;
		this.questImages[lastQuest].npcName.visible = false;
		this.questImages[lastQuest].desc.visible = false;
		this.questTexts.push(this.scene.add.text(x, this.bChooseQuest.y + 20 + this.questTexts.length*30, quest.name, {font: '20px "Arial"'}));
		let lastText = this.questTexts.length - 1;
		this.questTexts[lastText].index = lastText;
		this.questTexts[lastText].setInteractive();
		this.questTexts[lastText].on("pointerup", function() {
			self.ChangeQuestToShow(self.questTexts[lastText].index);
		});
		this.questTexts[lastText].on("pointerover", function(){
			self.pointer.visible = true;
			self.pointer.x = self.questTexts[lastText].x - 20;
			self.pointer.y = self.questTexts[lastText].y;
		})
		this.questTexts[lastText].on("pointerout",function(){
			self.pointer.visible = false;
		})
		this.questTexts[lastText].visible = false;
	}

	UpdateItem(item){
		let i = 0;
		while (i < this.itemImages.length && (this.itemImages[i].desc.text !== item.description)) 
		{
			i++;
		}
		this.itemImages[i].qty.setText("Cantidad: "+ ++this.itemImages[i].actualQty);
	}

	AddItem(item){
		let self = this;
		let x = 100;
		let y = 110;
		let descripcion = item.description;
		let image = this.scene.add.image(x,y,item.imgID).setOrigin(0,0).setScale(4);
		let descX = x + image.displayWidth + 30;
		let descY = y + image.y - 70;
		let desc = this.scene.make.text({
            x : descX,
            y : descY,
            text : descripcion,
            style: {
				wordWrap : {width : 200},
				font: '20px "Arial"'
            },
        });
		desc.setText(descripcion);

		this.itemImages.push({
			img: image,
			hp: this.scene.add.text(x,y + 180, "HP: " + item.hp, {font:'20px "Arial"'}).setOrigin(0,0),
			mp: this.scene.add.text(x,y + 220, "MP: " + item.mp, {font:'20px "Arial"'}).setOrigin(0,0),
			qty: this.scene.add.text(x,y + 140, "Cantidad: 1", {font:'20px "Arial"'}).setOrigin(0,0),
			desc: desc,
			actualQty: 1
		});
		let lastImage = this.itemImages.length - 1;
		this.itemImages[lastImage].img.visible = false;
		this.itemImages[lastImage].hp.visible = false;
		this.itemImages[lastImage].mp.visible = false;
		this.itemImages[lastImage].desc.visible = false;
		this.itemImages[lastImage].qty.visible = false;
		this.itemTexts.push(this.scene.add.text(x, this.bChooseItem.y + 20 + this.itemTexts.length*30, item.name, {font: '20px "Arial"'}));
		let lastText = this.itemTexts.length - 1;
		this.itemTexts[lastText].index = lastText;
		this.itemTexts[lastText].setInteractive();
		this.itemTexts[lastText].on("pointerup", function() {
			self.ChangeItemToShow(self.itemTexts[lastText].index);
		});
		this.itemTexts[lastText].on("pointerover", function(){
			self.pointer.visible = true;
			self.pointer.x = self.itemTexts[lastText].x - 20;
			self.pointer.y = self.itemTexts[lastText].y;
		})
		this.itemTexts[lastText].on("pointerout",function(){
			self.pointer.visible = false;
		})
		this.itemTexts[lastText].visible = false;
	}

	ChangeItemToShow(index){
		this.ShowItems(false);
		this.itemToShow = index;
		this.ShowItems(true);
	}

	ChangeQuestToShow(index){
		this.ShowQuests(false);
		this.questToShow = index;
		this.ShowQuests(true);
	}

	ShowItems(bool){
		this.viewItems = bool;
		if(this.itemImages.length !== 0){
			this.itemImages[this.itemToShow].img.visible = bool;
			this.itemImages[this.itemToShow].hp.visible = bool;
			this.itemImages[this.itemToShow].mp.visible = bool;
			this.itemImages[this.itemToShow].desc.visible = bool;
			this.itemImages[this.itemToShow].qty.visible = bool;
			let i = 0;
			for(let e of this.itemTexts){
				if (bool && i >= this.itemTextToShow && i < this.itemTextToShow + 4){
					e.visible = true;
					e.y = this.bChooseItem.y + 20 + (i - this.itemTextToShow)*30;
					e.setInteractive();
				}
				else{
					e.visible = false;
					e.disableInteractive();
				}
				i++;
			}
		}
		if(bool){
			this.upArrowItem.setInteractive();
			this.downArrowItem.setInteractive();
		}
		else{
			this.upArrowItem.disableInteractive();
			this.downArrowItem.disableInteractive();
		}
		this.upArrowItem.visible = bool;
		this.downArrowItem.visible = bool;
		this.bItem.visible = bool;
		this.bChooseItem.visible = bool;
	}

	ShowParty(bool){ // activamos/desactivamos el submenú de estado de la party
		// aquí se podrán seleccionar los diferentes integrantes de la party para ver sus stats.
		let self = this;
		this.upArrowParty.visible = bool;
		this.downArrowParty.visible = bool;
		if(bool){
			this.upArrowParty.setInteractive();
			this.downArrowParty.setInteractive();
		}
		else{
			this.upArrowParty.disableInteractive();
			this.downArrowParty.disableInteractive();
		}
		this.partyImages.forEach(function(images, index){
			let i = 0;
			if(index >= self.alliesShownIndex && index < self.alliesShownIndex + 4){
				let posY = (self.blockSize*self.scale * (index - (self.alliesShownIndex + i)));
				images.charIMG.y = self.blockSize/2*self.scale + posY;
				images.bImage.y = posY;
				images.statIMG.y = posY;
				
				images.stats.resistances.y =110+ posY;

				images.stats.rP.y = self.resOffset + posY;
				images.stats.rR.y = self.resOffset+ posY;
				images.stats.rE.y = self.resOffset+ posY;
				images.stats.rF.y = self.resOffset+ posY;
				images.stats.rT.y = self.resOffset+ posY;

				images.stats.hp.setPos(images.stats.hp.x, 10+posY);
				images.stats.mp.setPos(images.stats.hp.x, 40+posY);

				images.stats.attacks[0].y = self.attOffset + posY;
				images.stats.attacks[1].y = self.attOffset + self.attOffsetBetween + posY;
				images.stats.attacks[2].y = self.attOffset + self.attOffsetBetween * 2 + posY;
				images.stats.attacks[3].y = self.attOffset + self.attOffsetBetween * 3 + posY;

				images.attackInfo[0].bgIMG.y = self.attOffset + posY;
				images.attackInfo[0].type.y = self.attOffset + posY + self.attHoverOffset;
				images.attackInfo[0].dmg.y = self.attOffset + posY + self.attHoverOffset * 2;
				images.attackInfo[0].targets.y = self.attOffset + posY + self.attHoverOffset * 3;
				
				images.attackInfo[1].bgIMG.y = self.attOffset + self.attOffsetBetween + posY;
				images.attackInfo[1].type.y = self.attOffset + self.attOffsetBetween + posY + self.attHoverOffset;
				images.attackInfo[1].dmg.y = self.attOffset + self.attOffsetBetween + posY + self.attHoverOffset * 2;
				images.attackInfo[1].targets.y = self.attOffset + self.attOffsetBetween + posY + self.attHoverOffset * 3;
				
				images.attackInfo[2].bgIMG.y = self.attOffset + self.attOffsetBetween*2 + posY;
				images.attackInfo[2].type.y = self.attOffset + self.attOffsetBetween * 2 + posY + self.attHoverOffset;
				images.attackInfo[2].dmg.y = self.attOffset + self.attOffsetBetween * 2 + posY + self.attHoverOffset * 2;
				images.attackInfo[2].targets.y = self.attOffset + self.attOffsetBetween * 2 + posY + self.attHoverOffset * 3;
				
				images.attackInfo[3].bgIMG.y = self.attOffset + self.attOffsetBetween*3 + posY;
				images.attackInfo[3].type.y = self.attOffset + self.attOffsetBetween * 3 + posY + self.attHoverOffset;
				images.attackInfo[3].dmg.y = self.attOffset + self.attOffsetBetween * 3 + posY + self.attHoverOffset * 2;
				images.attackInfo[3].targets.y = self.attOffset + self.attOffsetBetween * 3 + posY + self.attHoverOffset * 3;
				
				
				images.charIMG.visible = bool;
				images.bImage.visible = bool;
				images.statIMG.visible = bool;

				images.stats.resistances.visible = bool;

				images.stats.rP.visible = bool;
				images.stats.rR.visible = bool;
				images.stats.rE.visible = bool;
				images.stats.rF.visible = bool;
				images.stats.rT.visible = bool;

				images.stats.hp.hide(!bool);
				images.stats.mp.hide(!bool);

				images.stats.attacks[0].visible = bool;
				images.stats.attacks[1].visible = bool;
				images.stats.attacks[2].visible = bool;
				images.stats.attacks[3].visible = bool;
				i++;
			}
			else{
				images.charIMG.visible = false;
				images.bImage.visible = false;
				images.statIMG.visible = false;
				images.stats.resistances.visible = false;
				//images.stats.maxHp.visible = bool;
				images.stats.rP.visible = false;
				images.stats.rR.visible = false;
				images.stats.rE.visible = false;
				images.stats.rF.visible = false;
				images.stats.rT.visible = false;
				images.stats.hp.hide(true);
				images.stats.mp.hide(true);
				images.stats.attacks[0].visible = false;
				images.stats.attacks[1].visible = false;
				images.stats.attacks[2].visible = false;
				images.stats.attacks[3].visible = false;
			}
		})

		this.Update();
	}

	ManageParty(bool){
		this.managerImages.forEach(function(images){
			images.bgIMG.visible = bool;
			if(bool) images.bgIMG.setInteractive();
			else images.bgIMG.disableInteractive();
			images.charIMG.visible = bool;
		});
		if(!bool){
			allyParty.swapAllies(this.managerImages);
			this.managerImages.forEach(function(image, index){
				image.index = index;
			})
		}
	}

	Hide(bool){
		this.ShowParty(!bool);
		this.ShowItems(!bool);
		this.ManageParty(!bool);
		this.Show(!bool);
	}
}