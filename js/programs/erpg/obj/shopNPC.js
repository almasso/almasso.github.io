import NPC from '../obj/npc.js';

export default class shopNPC extends NPC{
    constructor(scene, x, y, imageID, npcID, dialogues, manin, inv, items){
        super(scene, x, y, imageID, npcID, dialogues, manin);
        this.scene = scene;
        this.currentItem = -1;
        this.items = items;
        this.inventory = inv;
        this.shopHUD = this.scene.scene.get('hud').addShop(this);
    }

    buy(item){
        let isItem = this.inventory.boolIsItem(item.name);
        let bool = this.inventory.buy(item);
        if(bool && !isItem) this.scene.scene.get('hud').addItem(item);
        else if (bool && isItem) this.scene.scene.get('hud').updateItem(item);
        this.shopDialog(item, bool);
    }

    readDialogues(){
        super.readDialogues();
        this.shopHUD.buyButton.visible = true;
        this.shopHUD.naoButton.visible = true;
    }

    close(){
        this.scene.events.emit('closeShopping');
        super.closeWindow();
    }
}