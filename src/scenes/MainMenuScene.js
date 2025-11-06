import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
       
         const bg = this.add.image(0, -200, "gui", "mainMenuBackground.png").setOrigin(0).setScale(1.1);
        const gameName = this.add.image(200, -100, "gui", "mainMenuLogo.png").setOrigin(0).setScale(0.5);


        let startBtn = this.add.image(460, 450, "startBtn").setOrigin(0).setScale(0.15).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover', () => {
            this.scaleUpBtn(startBtn);
        });
        startBtn.on('pointerout',()=>{
            this.scaleDownBtn(startBtn);
        });
        startBtn.on('pointerdown',()=>{
            this.scene.start('GameScene');
        });
    }

    update() {
    }

    scaleUpBtn(obj){
        this.tweens.add({
                targets: obj,
                scale: 0.16,
                duration: 150,
                ease: 'Power1'
            });
    }
    scaleDownBtn(obj){
        this.tweens.add({
                targets: obj,
                scale: 0.15,
                duration: 150,
                ease: 'Power1'
            });
    }


}