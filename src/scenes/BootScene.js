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
            logo.destroy();

            this.registry.set('hp', 10);
            this.registry.set('maxHP', 10);
            this.registry.set('dmg', 2);
            this.registry.set('baseDmg', 2);
            this.registry.set('permanentShield', 0);
            this.registry.set('coins', 10);
            this.registry.set('scores', 0);
            this.registry.set('level', 1);
            this.registry.set('playerLength', 3);
            this.registry.set('playerInventory', [null, null, null, null, null]);
            this.registry.set('playerItems', []);
            this.registry.set('shopRefresh', 1);
            this.registry.set('refreshPrice', 1);

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

        //врееменные изображения
        this.load.image('refresh', './src/assets/sprites/NewSprites/refresh.png');
    }
}