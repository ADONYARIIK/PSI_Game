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

            const baseMaxHP = 10;
            const baseDmg = 2;

            this.registry.set('hp', baseMaxHP);
            this.registry.set('maxHP', baseMaxHP);
            this.registry.set('baseMaxHP', baseMaxHP);
            this.registry.set('dmg', baseDmg);
            this.registry.set('baseDmg', baseDmg);
            this.registry.set('permanentShield', 0);
            this.registry.set('basePermanentShield', 0);
            this.registry.set('coins', 10);
            this.registry.set('scores', 0);
            this.registry.set('level', 1);
            this.registry.set('playerLength', 3);
            this.registry.set('playerInventory', [null, null, null, null, null]);
            this.registry.set('playerItems', []);
            this.registry.set('shopRefresh', 1);
            this.registry.set('refreshPrice', 1);
            this.registry.set('isGameOver', false);

            const music = this.sound.add('theme', { loop: true, volume: 0.5 });
            music.play();
            this.registry.set('backgroundMusic', music);

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