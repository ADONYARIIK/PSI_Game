import Phaser from 'phaser';

export default class AuthorsScene extends Phaser.Scene {
    constructor() {
        super('AuthorsScene');
    }

    create(){
        const bg = this.add.image(0,0,"walls").setOrigin(0).setScale(1.1);
        const sign = this.add.image(200,200,"sign").setOrigin(0).setScale(0.1);
        const sign2 = this.add.image(700,200,"sign").setOrigin(0).setScale(0.1);
        
    }

    update(){

    }
}