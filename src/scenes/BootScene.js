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

        //Добавление фонтов
        WebFont.load({
            google: { families: ['Jacquard 12'] }
        });

        //добавление музыки и аудио
        this.load.audio('theme', './src/assets/audio/music/cottagecore.mp3');
    }
}