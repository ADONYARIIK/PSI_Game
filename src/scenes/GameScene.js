import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        this.registry.set('hp', 1);
        this.registry.set('coins', 0);
        this.registry.set('scores', 0);
        this.registry.set('level', 0);
        this.registry.set('playerLength', 3);

    }

    update() {

    }
}