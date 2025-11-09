import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create(){

        const settingsBox = this.add.image(0,0, 'settingsBox').setScale(0.4);
        const exit = this.add.image(155,-215,"exit").setScale(0.05).setInteractive({useHandCursor: true});


        const container = this.add.container(500,300, [settingsBox,exit]).setAlpha(0);

        const settingsIcon = this.add.image(25,610,'settingsIcon').setScale(0.05).setInteractive({useHandCursor: true});

        let settingsVisible = false;

        settingsIcon.on('pointerdown', ()=>{
            if(!settingsVisible){
                this.showSettings(container);
                settingsVisible = true;
            }
            else{
                this.hideSettings(container);
                settingsVisible = false;
            }
        });


        exit.on('pointerdown', ()=>{
            this.hideSettings(container)
        })
    }
    update(){

    }
    showSettings(obj){
        this.tweens.add({
            targets: obj,
            alpha: 1,
            duration: 300,
            ease: 'Back.Out'
        })
    }
    hideSettings(obj){
        this.tweens.add({
            targets: obj,
            alpha: 0,
            duration: 300,
            ease: 'Back.In'
        })
    }

}