import Phaser from 'phaser';

export default class AuthorsScene extends Phaser.Scene {
    constructor() {
        super('AuthorsScene');
    }

    create(){
        const bg = this.add.image(0,0,"walls").setOrigin(0).setScale(1.1);
    }

    update(){

    }
}