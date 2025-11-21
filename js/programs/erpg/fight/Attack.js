// clase con información de los ataques
export class Attack{
	constructor(name, type, dmg, requiredMps, targets){
		this.type = type; // tipo de ataque (Enumerator)
		this.dmg = dmg; // daño
		this.requiredMps = requiredMps; // Mana Points que necesita
		this.targets = targets; // nº de objetivos
		this.name = name; // nombre
		// Estados Alterados (FUTURO)
	}

	GetDmg() // getter de dmg
	{
		return this.dmg;
	}

	GetType() // getter de type
	{
		return this.type;
	}

	isSupport(){ // saber si un ataque es support o no
		return this.type === 5;
	}
}

// tipo especial de ataque (NO IMPLIMENTADO TODAVÍA)
export class Ultimate extends Attack{
	constructor(type, dmg, requiredMps, targets, turnsToActivate){
		super(type, dmg, requiredMps, targets);
		this.turnsToActivate = turnsToActivate;
		this.currentTurns = 0;
		this.activated = false;
		this.used = false;
	}

	UpdateUltimate() // actualizamos los turnos que le faltan
	{
		if(this.currentTurns < this.turnsToActivate)
			this.currentTurns++;
		else
			this.activated = true;
	}

	IsUsed(){ //Indica si un ataque ha sido usado
		return this.used;
	}

	Used() //Marca el ataque como usado
	{
		this.used = true;
	}

	Reset() //Resetea el estado del ataque
	{
		this.currentTurns = 0;
		this.used = false;
		this.activated = false;
	}
}

// función que devuelve un objeto según la información que le pongas
export function attackInfo(name,type,dmg,requiredMps,targets){
	return {name:name,type:type,dmg:dmg,requiredMps:requiredMps,targets:targets}
}

// enumerador de tipos de ataque
export const typeOfAttack = {
	Physical: 0,
	Ranged: 1,
	// Ataques que provocan estados alterados
	Fire: 2,
	Electrical: 3,
	Toxic: 4,
	// Ataque de curación
	Support: 5
};
export const elementalAttackDifference = 2;
