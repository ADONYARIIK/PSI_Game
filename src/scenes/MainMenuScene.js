import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        //this.scene.start('GameScene');
    }

    update() {
        const bg = this.add.image(0,-200,"gui","mainMenuBackground.png").setOrigin(0).setScale(1.1);
        const gameName = this.add.image(200,-100,"gui","mainMenuLogo.png").setOrigin(0).setScale(0.5);

        const startBtn = this.add.image(460,450,"startBtn").setOrigin(0).setScale(0.15).setInteractive({useHandCursor: true});
    }
}