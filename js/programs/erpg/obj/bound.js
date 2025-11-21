// bordes del mapa
export default class Bound extends Phaser.GameObjects.Sprite {

    // se construye un borde donde se especifique
    constructor(scene, x, y, scaleX, scaleY) {
        super(scene, x, y, 'pixel'); // se carga una imagen "pixel" que es un .png de 1x1px.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.add.collider(this); // le añadimos físicas para la que colisione con manín
        
        // Cambiamos el tamaño del body para ocupar todo el ancho de la escena
        this.body.width = scaleX;
        this.body.height = scaleY;
    }
  }