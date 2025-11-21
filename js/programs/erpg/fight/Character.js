import {Attack, Ultimate, typeOfAttack, elementalAttackDifference} from './Attack.js'

// clase de personaje en combate
export default class Character extends Phaser.GameObjects.Sprite {
	constructor(scene, name,x, y, imageId, actualHp, maxHp, actualMp, maxMp){
		super(scene, x, y, imageId);
		this.imageId = imageId; // imagen
		this.me = this.scene.add.existing(this); // añadimos a la escena de combate
		this.name = name; // nombre
		this.actualHp = actualHp; // vida actual
		this.maxHp = maxHp; // vida máxima
		this.actualMp = actualMp; // puntos de maná 
		this.maxMp = maxMp; // maná máximo
		this.lvl = 1; // nivel (NO IMPLEMENTADO)
		this.resistances = [0, 0, 0, 0, 0, 0]; // resistencias
		this.actualResistances = [0, 0, 0, 0, 0, 0]; // resistencias durante la pelea
		this.acurracy = 0; // puntería
		this.dead = false; // muerto
		this.speed = 0; // velocidad
		this.attacks = []; // ataques
		this.targets = []; // objetivos
		this.alteredStates = [false, false, false]; // estados alterados (quemado, paralizado, envenenado) 
		
		this.mon=imageId;

		this.scene.anims.create({
			
			key: this.mon+'_daño', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_dmg', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 1
		});

		this.scene.anims.create({
			key: this.mon+'_wow', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_wow', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 1
		});

		this.scene.anims.create({
			key: this.mon+'_idle', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_idle', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: -1
		});
		this.scene.anims.create({
			key: this.mon+'_dead', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_dead', 
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 0
		});

		this.scene.anims.create({
			
			key: this.mon+'_burn', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_burn', // cambiar animaciones cuando esten hechas
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 1
		});

		this.scene.anims.create({
			
			key: this.mon+'_poison', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_poison', // cambiar animaciones cuando esten hechas
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 1
		});

		this.scene.anims.create({
			
			key: this.mon+'_shock', //identificador de la animación
			frames: scene.anims.generateFrameNumbers(this.mon+'_shock',  // cambiar animaciones cuando esten hechas
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:2 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: 1
		});

		this.scene.anims.create({
			
			key:'dino_wake', //identificador de la animación
			frames: scene.anims.generateFrameNumbers('dino_wake', // cambiar animaciones cuando esten hechas
			{
				start:0, // primera imagen del Spritesheet que se ejecuta en la animación
				end:11 // última imagen del Spritesheet que se ejecuta en la animación
			}), 
			frameRate: 5, // imágenes/frames por segundo
			repeat: -1
		});

		

		this.on('animationcomplete', end =>{ //evento que se ejecuta cuando una animación ha terminado
			//console.log(this.anims.currentAnim.key)
			if(this.anims.currentAnim.key ==='dino_wake'){}
			if(this.anims.currentAnim.key === this.mon+'_daño' || this.anims.currentAnim.key === this.mon+'_wow' || 
			this.anims.currentAnim.key === this.mon+'_burn' || this.anims.currentAnim.key === this.mon+'_shock'
			 || this.anims.currentAnim.key === this.mon+'_poison'){ //comprobamos si la animación que ha terminado es 'attack'
				if(!this.dead)this.play(this.mon+'_idle'); //ejecutamos la animación 'idle'
				else this.play(this.mon+'_dead')
			}
			
		});

		this.play(this.mon+'_idle');

     	//#endregion
		// Estados Alterados (POR IMPLEMENTAR)
	}

	// Settear ataques
	SetAttacks(attack)
	{
		this.attacks.push(new Attack(attack.name, attack.type,attack.dmg,attack.requiredMps,attack.targets))
	}

	// getter de un ataque dado un index
	GetAttack(index){
		return this.attacks[index];
	}

	// setteamos las resistencias, la velocidad y la puntería
	SetStats(physicalRes, rangedRes, fireRes, electricalRes, toxicRes, acurracy, speed){
		this.resistances = [physicalRes, rangedRes, fireRes, electricalRes, toxicRes, 0];
		this.actualResistances = [physicalRes, rangedRes, fireRes, electricalRes, toxicRes, 0];
		this.acurracy = acurracy;
		this.speed = speed;
	}

	// setteamos las resistencias, la velocidad y la puntería
	SetAlteredStates(aStates){
		this.alteredStates = aStates; 
		if(this.alteredStates[typeOfAttack.Fire - elementalAttackDifference]) this.ReduceResistances(reduceBurnedRes);
		if(this.alteredStates[typeOfAttack.Toxic - elementalAttackDifference]) this.ReduceResistances(reduceToxicRes);
		if(this.alteredStates[typeOfAttack.Electrical - elementalAttackDifference]) this.ReduceResistances(reduceParalizedRes);
	}

	// puede atacar el personaje?
	CanAttack(attack){
		return this.actualMp >= attack.requiredMps;
	}

	// ataca 
	Attack(attack){
		let effective = [];
		let self = this;
		this.targets.forEach(function (enemy) {
			effective.push(enemy.Damage(attack, self.alteredStates[typeOfAttack.Fire - elementalAttackDifference], false));
		})
		this.actualMp -= attack.requiredMps;
		return effective; // devuelve la efectividad de un ataque frente a un target
	}

	// recibir daño
	Damage(attack, burned, isAlteredState)
	{
		// animación
		let currentHP=this.actualHp;

		let effective = {hit: 0, state: -1};
		let attackType = attack.GetType();
		let attackDmg = attack.GetDmg();
		// ROI AYUDA
		if(this.actualResistances[attackType] <= 3) effective.hit = -1;
		else if(this.actualResistances[attackType] >= 7) effective.hit = 1;

		// Hacer que reciba daño
		let attackProbability = Math.floor(Math.random()*100 + 1);
		if(attackProbability <= this.acurracy || attackType === typeOfAttack.Support || isAlteredState) // Los ataques de tipo Support no pueden fallar
		{
			
			let stateProbability = Math.floor(Math.random()*100 + 1);

			// Las dos primeras resistencias no tienen estado alterado 
			if(attackType > typeOfAttack.Ranged  && attackType != typeOfAttack.Support && (stateProbability > this.actualResistances[attackType] * 10)){
				let i = 0;
				if(this.alteredStates[attackType - elementalAttackDifference] === false){ // Si no tenía el estado alterado correspondiente
					this.alteredStates[attackType - elementalAttackDifference] = true; // Se aplica el estado alterado 
					if(attackType === typeOfAttack.Fire){
						this.ReduceResistances(reduceBurnedRes);
					}
					else if(attackType === typeOfAttack.Electrical){
						this.ReduceResistances(reduceParalizedRes);
					}
					else{
						this.ReduceResistances(reduceToxicRes);
					}
					effective.state = attackType;  // Información para el log
				}
			}
			if(burned) attackDmg /= 2; // Si el atacante está quemado se reduce su daño a la mitad

			// Bajamos vida en función de la resistencia y tipo del ataque
			this.actualHp -= attackDmg * (10 - this.actualResistances[attackType]) / 10;
			this.actualHp = Math.floor(this.actualHp);
			if(this.actualHp <= 0) 
			{
				this.actualHp = 0;
				this.Die(); // morir si estamos a 0 o menor vida
			}
			else if (this.actualHp > this.maxHp) this.actualHp = this.maxHp;

		}
		else effective.hit = 2; // Si la probabilidad del ataque es superior a la probabilidad del personale, el ataque falló
		if(this.actualHp<currentHP && this.actualHp>0)this.play(this.mon+'_daño');
		return effective; // devuelve la efectividad de un ataque 
	}

	// morir
	Die()
	{
		this.play(this.mon+'_dead');
		this.dead = true; // se muere
	}

	ReduceResistances(arrayDiff){ // Array con las el número que se resta a las resistencias
		let self = this;
		arrayDiff.forEach(function (res){
			self.actualResistances[res.index] -= res.value;
		})
	}

	
	Heal(){
		this.actualHp = this.maxHp;
		this.actualMp = this.maxMp;
		this.dead = false;
		this.alteredStates = [false, false, false];
		let self = this;
		this.actualResistances.forEach(function (res,index){
			res = self.resistances[index];
		});
	}

	// Métodos para usar con los items
	HealBurned(){
		if(this.alteredStates[typeOfAttack.Fire - elementalAttackDifference]){
			let self = this;
			reduceBurnedRes.forEach(function (res){
				self.actualResistances[res.index] += res.value;
			})
		}
	}

	HealParalized(){
		if(this.alteredStates[typeOfAttack.Electrical - elementalAttackDifference]){
			let self = this;
			reduceBurnedRes.forEach(function (res){
				self.actualResistances[res.index] += res.value;
			})
		}
	}

	HealPoisoned(){
		if(this.alteredStates[typeOfAttack.Toxic - elementalAttackDifference]){
			let self = this;
			reduceBurnedRes.forEach(function (res){
				self.actualResistances[res.index] += res.value;
			})
		}
	}

	Burned(){
		this.Damage(burned, false, true);
	}

	Paralized(){ // Por ahora no implementado

	}

	Poisoned(){
		this.Damage(poisoned, false, true);
	}
}


// No se si hacer esto asi, porque es posible que lo tengan todos los characters repetido
// Deberia ser global y que se use cuando se quiera;
let burned = new Attack("Quemado", 2, 10, 0, 1);
let poisoned = new Attack("Envenenado", 4, 10, 0, 1);

let reduceBurnedRes = [{value : 2, index : typeOfAttack.Physical}, {value : 1, index : typeOfAttack.Ranged},
{value: 1, index : typeOfAttack.Fire}];
let reduceParalizedRes = [{value: 2, index : typeOfAttack.Electrical}];
let reduceToxicRes = [{value: 2, index : typeOfAttack.Toxic}];
