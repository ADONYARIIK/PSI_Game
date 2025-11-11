import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('logo', './src/assets/logo.png');
    }

    create() {

        const { width, height } = this.scale;
        const logo = this.add.image(width / 2, height / 2, 'logo').setScale(0.8);

        this.loadAssets();

        this.load.on('complete', () => {
            // const spriteFrames = this.textures.get('sprites').getFrameNames();
            // console.log('🔍 Все кадры атласа "sprites":', spriteFrames);
            logo.destroy();
            this.scene.start('MainMenuScene');
        })

        this.load.start();
    }

    loadAssets() {
        this.load.atlas('gui', './src/assets/atlas/gui_spritesheet.png', './src/assets/atlas/gui_spritesheet.json');
        this.load.atlas('sprites', './src/assets/atlas/spritesheet.png', './src/assets/atlas/spritesheet.json');

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }
}