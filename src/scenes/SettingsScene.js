import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        //видимый контейнер
        const settingsBox = this.add.image(0, 0, 'settingsBox').setScale(0.4);

        //кнопка выхода 
        const exit = this.add.image(155, -215, "exit").setScale(0.05).setInteractive({ useHandCursor: true });

        //контейнер
        const container = this.add.container(500, 300, [settingsBox, exit]).setAlpha(0);

        //текст
        WebFont.load({
           google: {
               families: ['Jacquard 12']
           },
           active: () => {
               const soundText = this.add.text(-40,-80,'Sound',{ fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
                container.add(soundText);
           }

        })
        // вкл/выкл музыку
        this.time.delayedCall(100, ()=>{

            const music = this.registry.get('music');

            const soundOn = this.add.image(0, 0, "soundOn").setScale(0.1).setInteractive({ useHandCursor: true });
            soundOn.on('pointerover', () => {
                this.scaleUpBtn(soundOn, 0.12);
            });
            soundOn.on('pointerout', () => {
                this.scaleDownBtn(soundOn, 0.1);
            });


            const soundOff = this.add.image(0, 0, "soundOff").setScale(0.1).setVisible(false).setInteractive({ useHandCursor: true });
            soundOff.on('pointerover', () => {
                this.scaleUpBtn(soundOff, 0.12);
            });
            soundOff.on('pointerout', () => {
                this.scaleDownBtn(soundOff, 0.1);
            });


            soundOn.on('pointerdown', () => {
                soundOff.setVisible(true);
                music.stop();
                soundOff.on('pointerdown', () => {
                    soundOff.setVisible(false);
                    music.play();
                })
            })
            container.add([soundOn, soundOff]);
        });


        
        //иконка слева снизу экрана
        const settingsIcon = this.add.image(25, 610, 'settingsIcon').setScale(0.05).setInteractive({ useHandCursor: true });

        //переменная следящая за видимостью настроек
        let settingsVisible = false;

        //открытие окна с настройками
        settingsIcon.on('pointerdown', () => {
            if (!settingsVisible) {
                this.showSettings(container);
                settingsVisible = true;
            }
            else {
                this.hideSettings(container);
                settingsVisible = false;
            }
        });

        //кнопка выхода
        exit.on('pointerdown', () => {
            this.hideSettings(container)
        })
    }
    update() {

    }
    showSettings(obj) {
        this.tweens.add({
            targets: obj,
            alpha: 1,
            duration: 300,
            ease: 'Back.Out'
        })
    }
    hideSettings(obj) {
        this.tweens.add({
            targets: obj,
            alpha: 0,
            duration: 300,
            ease: 'Back.In'
        })
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