import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        //запуск сцены 
        if(!this.scene.isActive('MusicScene')){
            this.scene.launch('MusicScene');
        }
        const bg = this.add.image(0, -200, "gui", "mainMenuBackground.png").setOrigin(0).setScale(1.1);
        const gameName = this.add.image(200, -100, "gui", "mainMenuLogo.png").setOrigin(0).setScale(0.5);

        const startBtn = this.add.image(460, 450, "startBtn").setOrigin(0).setScale(0.15).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover', () => {
            this.scaleUpBtn(startBtn, 0.16);
        });
        startBtn.on('pointerout',()=>{
            this.scaleDownBtn(startBtn, 0.15);
        });
        startBtn.on('pointerdown',()=>{
            this.scene.start('GameScene');
        });

        //задержка что бы create успел проверить есть ли музыка
        this.time.delayedCall(100, () => {

            const music = this.registry.get('music');

            const soundOn = this.add.image(1000,400,"soundOn").setScale(0.1).setInteractive({ useHandCursor: true });
            soundOn.on('pointerover', () => {
                this.scaleUpBtn(soundOn, 0.12);
            });
            soundOn.on('pointerout',()=>{
                this.scaleDownBtn(soundOn, 0.1);
            });
    
    
            const soundOff = this.add.image(1000,400,"soundOff").setScale(0.1).setVisible(false).setInteractive({ useHandCursor: true });
            soundOff.on('pointerover', () => {
                this.scaleUpBtn(soundOff, 0.12);
            });
            soundOff.on('pointerout',()=>{
                this.scaleDownBtn(soundOff, 0.1);
            });
    
    
            soundOn.on('pointerdown', ()=>{
                soundOff.setVisible(true);
                music.stop();
                soundOff.on('pointerdown', ()=>{
                    soundOff.setVisible(false);
                    music.play();
                })
            })
        });

        const authors = this.add.image(125,400,"authors").setScale(0.1).setInteractive({ useHandCursor: true });
        authors.on('pointerover', () => {
            this.scaleUpBtn(authors, 0.12);
        });
        authors.on('pointerout',()=>{
            this.scaleDownBtn(authors, 0.1);
        });

        authors.on('pointerdown',()=>{
            this.scene.start('AuthorsScene');
        });
    }

    update() {
    }

    scaleUpBtn(obj, scale){
        this.tweens.add({
                targets: obj,
                scale: scale,
                duration: 150,
                ease: 'Power1'
            });
    }
    scaleDownBtn(obj, scale){
        this.tweens.add({
                targets: obj,
                scale: scale,
                duration: 150,
                ease: 'Power2'
            });
    }


}