import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        //видимый контейнер
        const settingsBox = this.add.image(0, 0, 'gui', 'settingsBox.png').setScale(0.4);

        //кнопка выхода 
        const exit = this.add.image(155, -215, 'gui', "exit.png").setScale(0.05).setInteractive({ useHandCursor: true });

        //контейнер
        const container = this.add.container(500, 300, [settingsBox, exit]).setAlpha(0).setVisible(false);

        //текст
        const soundText = this.add.text(-40, -10, 'Sound', { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        container.add(soundText);

        // вкл/выкл музыку
        this.time.delayedCall(100, () => {

            const music = this.registry.get('music');

            const soundOff = this.add.image(0, 70, 'gui', "soundOff.png").setScale(0.1).setVisible(false).setInteractive({ useHandCursor: true });
            soundOff.on('pointerover', () => {
                this.scaleUpBtn(soundOff, 0.12);
            });
            soundOff.on('pointerout', () => {
                this.scaleDownBtn(soundOff, 0.1);
            });
            if (!music.isPlaying) {
                soundOff.setVisible(true);
            }
            const soundOn = this.add.image(0, 70, 'gui', "soundOn.png").setScale(0.1).setInteractive({ useHandCursor: true });
            soundOn.on('pointerover', () => {
                this.scaleUpBtn(soundOn, 0.12);
            });
            soundOn.on('pointerout', () => {
                this.scaleDownBtn(soundOn, 0.1);
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

        //кнопка домой
        const home = this.add.image(0, -80, 'gui', 'home.png').setScale(0.07).setInteractive({ useHandCursor: true });
        container.add(home);


        home.on('pointerover', () => {
            this.scaleUpBtn(home, 0.09);
        });
        home.on('pointerout', () => {
            this.scaleDownBtn(home, 0.07);
        });

        //закрытие всех сцен и возвращение в главное меню
        home.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('MainMenuScene');
        });

        //текст домой
        const homeText = this.add.text(-40, -160, 'Home', { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        container.add(homeText);



        //иконка слева снизу экрана
        const settingsIcon = this.add.image(25, 610, 'gui', 'settingsIcon.png').setScale(0.05).setInteractive({ useHandCursor: true });

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
        obj.setVisible(true)
        this.tweens.add({
            targets: obj,
            alpha: 1,
            duration: 300,
            ease: 'Back.Out'
        })
    }
    hideSettings(obj) {
        obj.setVisible(false)
        this.tweens.add({
            targets: obj,
            alpha: 0,
            duration: 300,
            ease: 'Back.In'
        })
    }
    scaleUpBtn(obj, scale) {
        this.tweens.add({
            targets: obj,
            scale: scale,
            duration: 150,
            ease: 'Power1'
        });
    }
    scaleDownBtn(obj, scale) {
        this.tweens.add({
            targets: obj,
            scale: scale,
            duration: 150,
            ease: 'Power2'
        });
    }

}