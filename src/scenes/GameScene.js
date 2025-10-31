import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
    }

    update() {

    }
}