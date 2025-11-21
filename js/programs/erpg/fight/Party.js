import {attackInfo} from "../fight/Attack.js"
import {EnviromentInfo} from "../fight/EnviromentInfo.js"
import { QuestLog } from '../Quest.js';
import Inventory from '../obj/Inventory.js';


// Esta clase gestionará todo lo que tenga que ver con aliados
export class Party{
	constructor()
	{
		// ahora mismo se construye con manín
		this.party = [
			characterInfo("Manín","manin",100,100,100,100,5,7,4,3,5,100,50,
					 [
						attackInfo("Churrazo",0,15,0,2),
						attackInfo("Podación",0,30,15,1),
					  	attackInfo("Pistola Agua",1,45,25,2),
						attackInfo("Asserting Dominance",3,60,60,1)
					])
				];
		this.party[0].index = 0;
		this.party[0].initialIndex = 0;
		this.alliesNum = this.party.length;
		if(this.alliesNum > 4) this.alliesNum = 4;
		this.questLog = new QuestLog();
		this.inventory = new Inventory();
	}

	swapAllies(newOrder){
		let self = this
		this.party.forEach(function(ally, index) {
			if(newOrder[index].index != ally.index){
				let num = 0;
				while(index != newOrder[num].index)
				{
					num++;
				}
				[self.party[index], self.party[num]] = 
				[self.party[num], self.party[index]]; // esto no acaba de cambiar y no comprendo
			}
		});

		this.party.forEach(function(ally, index) {
			ally.index = index;
		});
	}

	// añadimos a un personaje (NO IMPLEMENTADO)
	Add(character){
		this.party.push(character);
		if(this.alliesNum < 4) this.alliesNum++;
		else this.alliesNum = 4;
		console.log(this.party.length-1);
		this.party[this.party.length-1].index = this.party.length - 1;
		this.party[this.party.length-1].initialIndex = this.party.length - 1;
		this.party[this.party.length-1].alteredStates = [false,false,false];
	}

	// Llevamos la party al estado original (TEMPORAL)
	RestartParty()
	{
		this.party = [
			characterInfo("Manín","manin",100,100,100,100,5,7,4,3,5,100,50,
					 [
						attackInfo("Churrazo",0,15,0,2),
						attackInfo("Podación",0,30,15,1),
					  	attackInfo("Pistola Agua",1,45,25,2),
						attackInfo("Asserting Dominance",3,60,60,1)
					]),
					];
		this.party[0].index = 0;
		this.party[0].initialIndex = 0;
		this.alliesNum = this.party.length;
		if(this.alliesNum > 4) this.alliesNum = 4;
		this.questLog = new QuestLog();
		this.inventory = new Inventory();
	}
};

// función que devuvelve un objeto con información de un personaje
function characterInfo(name, imgID, actualHp, maxHp, actualMp, maxMp, rP, rR, rF, rE, rT, acurracy, speed, attack){
	return {name:name,imgID:imgID, actualHp: actualHp, maxHp: maxHp, actualMp: actualMp, maxMp: maxMp, rP:rP,rR:rR,rF:rF,rE:rE,rT:rT,acurracy:acurracy,speed:speed, attack:attack, index: 0, alteredStates : [false,false,false]}
}

// exportamos una variable de tipo party que será la instancia que queremos
export let allyParty = new Party();