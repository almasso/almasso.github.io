import {getRoot} from "./../../../utils.js"

export default class Boot extends Phaser.Scene {
	/**
	 * Escena inicial en la que se cargan todos
	 * los assets necesarios para ejecutar el juego
	 * @extends Phaser.Scene
	 */
	constructor() {
		super({ key: 'boot' });
	}

	preload() {
		// Barra de cargando página (borde)........................................................................................
		let progressBar = this.add.graphics();
		let progressBox = this.add.graphics();
		progressBox.fillStyle(0x22ff44, 0.8);
		progressBox.fillRect(340, 250, 120, 50);

		// Barra de cargando página........................................................................................
		this.load.on('progress', function (value) {
			percentText.setText(parseInt(value * 100) + '%');
			progressBar.clear();
			progressBar.fillStyle(0xffffff, 1);
			progressBar.fillRect(350, 260, 100 * value, 30);
		});

		// Textos de cargando página........................................................................................
		let width = this.cameras.main.width;
		let height = this.cameras.main.height;
		let loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 70,
			text: 'CARGANDO O MELHOR JOGO DO MUNDINHO',
			style: {
				font: '20px monospace',
				fill: '#ffffff'
			}
		});
		loadingText.setOrigin(0.5, 0.5);

		let percentText = this.make.text({
			x: width / 2,
			y: height / 2 + 15,
			text: '0%',
			style: {
				font: '18px monospace',
				fill: '#ffffff'
			}
		});
		percentText.setOrigin(0.5, 0);
        
        // Cargamos todas las imágenes de nuestro juego:

        // HUD
        this.load.image('logButton',`${getRoot()}assets/icons/programs/erpg/textures/HUD/logButton.png`);
        this.load.image('resP', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resP.png`);
		this.load.image('resR', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resR.png`);
		this.load.image('resE', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resE.png`);
		this.load.image('resF', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resF.png`);
		this.load.image('resT', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resT.png`);
		this.load.image('miniHUD', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/miniHUD.png`);
		this.load.image('menuBG', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/menuBG.png`);
		this.load.image('menuPartyButton', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/menuPartyButton.png`);
		this.load.image('menuOrderButton', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/menuOrderButton.png`);
		this.load.image('pointer', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/pointer.png`);
		this.load.image('partyStateBG', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/partyStateBG.png`);
		this.load.image('resistancesText', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/resistancesText.png`);
		this.load.image('partyStats', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/partyStats.png`);
		this.load.image('startButton', `${getRoot()}assets/icons/programs/erpg/textures/HUD/StartInicio.png`);
		this.load.image('retryButton', `${getRoot()}assets/icons/programs/erpg/textures/HUD/Retry.png`); 
        this.load.image('attackPointer',`${getRoot()}assets/icons/programs/erpg/textures/HUD/attackPointer.png`);
        this.load.image('log',`${getRoot()}assets/icons/programs/erpg/textures/HUD/log.png`);
		this.load.image('attackButton',`${getRoot()}assets/icons/programs/erpg/textures/HUD/attackButton.png`);
		this.load.image('attackButtonHover',`${getRoot()}assets/icons/programs/erpg/textures/HUD/attackButtonHover.png`);
		this.load.image('objectButton',`${getRoot()}assets/icons/programs/erpg/textures/HUD/objectButton.png`);
		this.load.image('objectButtonHover',`${getRoot()}assets/icons/programs/erpg/textures/HUD/objectButtonHover.png`);
        this.load.image('AllyBlock',`${getRoot()}assets/icons/programs/erpg/textures/HUD/AllyBlock.png`);
		this.load.image('attackBlock',`${getRoot()}assets/icons/programs/erpg/textures/HUD/AllyAttack.png`);
		this.load.image('buy', `${getRoot()}assets/icons/programs/erpg/textures/HUD/buyButton.png`);
		this.load.image('noBuy', `${getRoot()}assets/icons/programs/erpg/textures/HUD/noButton.png`);
		this.load.image('buyItem', `${getRoot()}assets/icons/programs/erpg/textures/HUD/buyItem.png`);
		this.load.image('showItem', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/itemsButton.png`);
		this.load.image('showQuests', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/menuQuestsButton.png`);
		this.load.image('devsBg', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/devsBg.png`);
		

		// nosotros c:
		this.load.image('alex', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex.png`);
		this.load.image('alexHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/AlexHead.png`);
        this.load.spritesheet('alex_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_dmg.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_shock.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_poison.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_dead.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_burn.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_idle.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('alex_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Alex_wow.png`,{frameWidth:19, frameHeight:26});

		this.load.image('raul', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul.png`);
		this.load.image('raulHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/raulHead.png`);
		this.load.spritesheet('raul_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_dmg.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_shock.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_poison.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_dead.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_burn.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_idle.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('raul_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Raul_wow.png`,{frameWidth:19, frameHeight:26});

		this.load.image('pablo', `${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo.png`);
		this.load.image('pabloHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/pabloHead.png`);
		this.load.spritesheet('pablo_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_dmg.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_shock.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_poison.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_dead.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_burn.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_idle.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('pablo_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/pablo_wow.png`,{frameWidth:19, frameHeight:26});
		
		this.load.image('roi', `${getRoot()}assets/icons/programs/erpg/textures/Characters/roi.png`);
		this.load.image('roiHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/roiHead.png`);
		this.load.spritesheet('roi_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_dmg.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_shock.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_poison.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_dead.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_burn.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_idle.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('roi_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/roi_wow.png`,{frameWidth:19, frameHeight:26});
		
		this.load.image('david', `${getRoot()}assets/icons/programs/erpg/textures/Characters/david.png`);
		this.load.image('davidHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/davidHead.png`);
		this.load.spritesheet('david_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_dmg.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_shock.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_poison.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_dead.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_burn.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_idle.png`,{frameWidth:19, frameHeight:26});
        this.load.spritesheet('david_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/david_wow.png`,{frameWidth:19, frameHeight:26});
        
		// NPCS
		this.load.image('elmotivao', `${getRoot()}assets/icons/programs/erpg/textures/Characters/elmotivao.png`);
		this.load.image('vovovo', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Vovovo.png`);
		this.load.image('jatsune', `${getRoot()}assets/icons/programs/erpg/textures/Characters/jatsune.png`);


		this.load.image('compuman', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Compuman.png`);
		this.load.image('frozono', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Frozono.png`);
		this.load.image('unverifiedtoni', `${getRoot()}assets/icons/programs/erpg/textures/Characters/toni1.png`);
		this.load.image('verifiedtoni', `${getRoot()}assets/icons/programs/erpg/textures/Characters/toni2.png`);
		this.load.image('pepperboy', `${getRoot()}assets/icons/programs/erpg/textures/Characters/PepperBoy.png`);
        this.load.image('kratos',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/Kratos.png`); 
		this.load.image('aloy',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/Aloy.png`); 
        this.load.image('culturista',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Culturista.png`);
		this.load.image('patri', `${getRoot()}assets/icons/programs/erpg/textures/Characters/patri.png`);
		this.load.image('sanxe', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe.png`);
		this.load.image('health', `${getRoot()}assets/icons/programs/erpg/textures/Characters/chiringo.png`);
		this.load.image('andrea', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Andrea.png`);
		this.load.image('joker',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/Joker2.png`); 
		this.load.image('homero',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/Homero.png`); 
		this.load.image('spider',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/spiderMan.png`); 
		this.load.image('patrik',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/patrik.png`); 
		this.load.image('bob',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/bob.png`); 
		this.load.image('tienda', `${getRoot()}assets/icons/programs/erpg/textures/Characters/tienda.png`);
		this.load.image('sirenita',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/sirenita.png`); 
		this.load.image('rick',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/rick.png`); 
		this.load.image('ikerJimenez',`${getRoot()}assets/icons/programs/erpg/textures/NPC-RAUL/ikerjimenez.png`);
		this.load.image('tiolavara', `${getRoot()}assets/icons/programs/erpg/textures/Characters/tiolavara.png`); 
		this.load.image('fisher', `${getRoot()}assets/icons/programs/erpg/textures/Characters/fisherman.png`);
		this.load.image('delincuente', `${getRoot()}assets/icons/programs/erpg/textures/Characters/delincuentes.png`);
		this.load.image('PabloMotos', `${getRoot()}assets/icons/programs/erpg/textures/Characters/PabloMotos.png`);

        // FONDOS
        this.load.image('initialBg', `${getRoot()}assets/icons/programs/erpg/textures/HUD/Inicio.png`);
        this.load.image('square', `${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/plaza2.png`);
        this.load.image('fightParkBg',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/parqueLucha.png`)
        this.load.image('fightHomeBg',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/casaLucha.png`)
        this.load.image('finalBg', `${getRoot()}assets/icons/programs/erpg/textures/HUD/Gameover.png`);
		this.load.image('park',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/park.png`)
		this.load.image('clif',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/clif.png`)
		this.load.image('home',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/home.png`)
		this.load.image('plazaNoche',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/plazaNoche.png`)
		this.load.image('angelPark',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/angel.png`)
		this.load.image('bg_dino',`${getRoot()}assets/icons/programs/erpg/textures/Backgrounds/wakeDino.png`)

        // PROPS
        this.load.image('pixel', `${getRoot()}assets/icons/programs/erpg/textures/Props/pixel1x1.png`);
        this.load.image('flecha', `${getRoot()}assets/icons/programs/erpg/textures/Props/flecha.png`);
		this.load.image('hierba', `${getRoot()}assets/icons/programs/erpg/textures/Props/hierba.png`);
		this.load.image('insignia', `${getRoot()}assets/icons/programs/erpg/textures/Props/insignia.png`);
		this.load.image('tree', `${getRoot()}assets/icons/programs/erpg/textures/Props/tree.png`);
		this.load.image('valla', `${getRoot()}assets/icons/programs/erpg/textures/Props/valla.png`);
		this.load.image('ten', `${getRoot()}assets/icons/programs/erpg/textures/Props/ten.png`);
		this.load.image('text', `${getRoot()}assets/icons/programs/erpg/textures/Props/text.png`);
		this.load.image('textAngel', `${getRoot()}assets/icons/programs/erpg/textures/Props/angelText.png`);
		this.load.image('textDino', `${getRoot()}assets/icons/programs/erpg/textures/Props/dinoText.png`);
		this.load.image('emptyShop', `${getRoot()}assets/icons/programs/erpg/textures/Props/tienda.png`);
		this.load.image('emptyBar', `${getRoot()}assets/icons/programs/erpg/textures/Props/Bar.png`);
		this.load.image('z1', `${getRoot()}assets/icons/programs/erpg/textures/Props/Z1.png`);
		this.load.image('intro', `${getRoot()}assets/icons/programs/erpg/textures/Props/intro.png`);
		this.load.image('caña', `${getRoot()}assets/icons/programs/erpg/textures/Props/caña.png`);
		this.load.image('dinostatue',`${getRoot()}assets/icons/programs/erpg/textures/Characters/dinoestatua.png`);
		this.load.image('dinoRoto',`${getRoot()}assets/icons/programs/erpg/textures/Characters/dinoRoto.png`);
		this.load.image('guitarra',`${getRoot()}assets/icons/programs/erpg/textures/Props/guitarra.png`);

        // ANIMACIONES
		this.load.spritesheet('manin_move',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_move.png`,{frameWidth:25, frameHeight:32});
		this.load.spritesheet('manin_pop',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_pop.png`,{frameWidth:25, frameHeight:32});
		this.load.spritesheet('manin_pose',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_pose.png`,{frameWidth:25, frameHeight:32});
		this.load.spritesheet('dino_wake',`${getRoot()}assets/icons/programs/erpg/textures/Characters/dino_wake.png`,{frameWidth:58, frameHeight:50});

        // generic
        this.load.spritesheet('people_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/people_dmg.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('people_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/people_idle.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('people_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/people_wow.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('people_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/people_dead.png`,{frameWidth:19, frameHeight:26});

        // artista
		this.load.image('artist',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Artista2.png`); 
        this.load.image('artistHead',`${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/artista2Head.png`);
		this.load.spritesheet('artist_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_dmg.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_idle.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_wow.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_dead.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_burn.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_poison.png`,{frameWidth:24, frameHeight:32});
		this.load.spritesheet('artist_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/artist_shock.png`,{frameWidth:24, frameHeight:32});

        // manín
		this.load.image('manin', `${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_new.png`);
        this.load.image('maninHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/maninHead.png`);
		this.load.spritesheet('manin_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_dmg.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_idle.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_wow.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_dead.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_burn.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_poison.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('manin_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/manin_shock.png`,{frameWidth:19, frameHeight:26});

        // melendi
		this.load.image('melendi',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Melendi.png`);
		this.load.image('melendiHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/melendiHead.png`);
		this.load.spritesheet('melendi_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_dmg.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_idle.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_wow.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_dead.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_burn.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_poison.png`,{frameWidth:22, frameHeight:27});
		this.load.spritesheet('melendi_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/melendi_shock.png`,{frameWidth:22, frameHeight:27});

        // jarfaiter
		this.load.image('jarfaiter',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter.png`);
		this.load.image('jarfaiterHead',`${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/jarfaiterHead.png`);
		this.load.spritesheet('jarfaiter_idle', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_idle.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('jarfaiter_wow', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_wow.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('jarfaiter_dmg', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_dmg.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('jarfaiter_dead', `${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_dead.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('jarfaiter_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_burn.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('jarfaiter_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_poison.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('jarfaiter_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Jarfaiter_shock.png`,{frameWidth:19, frameHeight:26});

		//pedro sanxe
		this.load.image('sanxe', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe.png`);
        this.load.image('sanxeHead', `${getRoot()}assets/icons/programs/erpg/textures/HUD/explore/sanxeHead.png`);
		this.load.spritesheet('sanxe_idle', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_idle.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('sanxe_wow', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_wow.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('sanxe_dmg', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_dmg.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('sanxe_dead', `${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_dead.png`,{frameWidth:19, frameHeight:26})
		this.load.spritesheet('sanxe_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_burn.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('sanxe_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_poison.png`,{frameWidth:19, frameHeight:26});
		this.load.spritesheet('sanxe_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/sanxe_shock.png`,{frameWidth:19, frameHeight:26});

		// angel caido
		this.load.image('angel',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_idle.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_wow.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_dmg.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_dead.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_burn.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_poison.png`,{frameWidth:59, frameHeight:50});
		this.load.spritesheet('angel_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/AngelCaido_shock.png`,{frameWidth:59, frameHeight:50});

		// dinoseto
		this.load.image('dinoseto',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto.png`);
		this.load.spritesheet('dinoseto_idle',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_idle.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_wow',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_wow.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_dmg',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_dmg.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_dead',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_dead.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_burn',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_burn.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_poison',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_poison.png`,{frameWidth:58, frameHeight:40});
		this.load.spritesheet('dinoseto_shock',`${getRoot()}assets/icons/programs/erpg/textures/Characters/Dinoseto_shock.png`,{frameWidth:58, frameHeight:40});




		// objetos
		this.load.image('cigarro', `${getRoot()}assets/icons/programs/erpg/textures/Props/cigarro.png`);
		this.load.image('dalsyF', `${getRoot()}assets/icons/programs/erpg/textures/Props/dalsyFresa.png`);
		this.load.image('dalsyN', `${getRoot()}assets/icons/programs/erpg/textures/Props/dalsyNaranja.png`);
		this.load.image('fria', `${getRoot()}assets/icons/programs/erpg/textures/Props/fria.png`);
		this.load.image('kebab', `${getRoot()}assets/icons/programs/erpg/textures/Props/kebab.png`);
		this.load.image('porro', `${getRoot()}assets/icons/programs/erpg/textures/Props/porro.png`);
		this.load.image('tartaS', `${getRoot()}assets/icons/programs/erpg/textures/Props/tartaSantiago.png`);
		this.load.image('i200', `${getRoot()}assets/icons/programs/erpg/textures/Props/cigarro.png`);
		this.load.image('i600', `${getRoot()}assets/icons/programs/erpg/textures/Props/cigarro.png`);
		this.load.image('i1', `${getRoot()}assets/icons/programs/erpg/textures/Props/cigarro.png`);
		this.load.image('piezaDino', `${getRoot()}assets/icons/programs/erpg/textures/Props/piezaDino.png`);


        //JSON
        this.load.json('npc_dialogues', `${getRoot()}assets/icons/programs/erpg/dialogues/npc_dialog.json`);
		this.load.json('quests', `${getRoot()}assets/icons/programs/erpg/dialogues/quests_dialogs.json`);

		//MÚSICA
		this.load.audio('intro', [`${getRoot()}assets/icons/programs/erpg/sounds/intro.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/intro.mp3`,])
		this.load.audio('startbutton',  [`${getRoot()}assets/icons/programs/erpg/sounds/startbutton.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/startbutton.mp3`,])
		this.load.audio('dreamon', [`${getRoot()}assets/icons/programs/erpg/sounds/dreamon.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/dreamon.mp3`,]);
		this.load.audio('rickroll', [`${getRoot()}assets/icons/programs/erpg/sounds/rickroll.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/rickroll.mp3`,]);
		this.load.audio('combat', [`${getRoot()}assets/icons/programs/erpg/sounds/combat.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/combat.mp3`,]);
		this.load.audio('bossfight', [`${getRoot()}assets/icons/programs/erpg/sounds/bossfight.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/bossfight.mp3`,]);
		this.load.audio('victory', [`${getRoot()}assets/icons/programs/erpg/sounds/victory.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/victory.mp3`,]);
		this.load.audio('devs', [`${getRoot()}assets/icons/programs/erpg/sounds/devs.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/devs.mp3`,]);
		this.load.audio('park', [`${getRoot()}assets/icons/programs/erpg/sounds/park.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/park.mp3`,]);
		this.load.audio('square', [`${getRoot()}assets/icons/programs/erpg/sounds/square.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/square.mp3`,]);
		this.load.audio('cinematic1', [`${getRoot()}assets/icons/programs/erpg/sounds/square.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/square.mp3`,]);
		this.load.audio('wind', [`${getRoot()}assets/icons/programs/erpg/sounds/wind.ogg`, `${getRoot()}assets/icons/programs/erpg/sounds/wind.mp3`,]);
		

        // Destruye la barra de cargando página
		this.load.on('complete', function () {
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
		});
    }

	create() {
		this.scene.launch('initial');
	}
}

