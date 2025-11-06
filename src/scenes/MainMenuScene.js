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
    }
}