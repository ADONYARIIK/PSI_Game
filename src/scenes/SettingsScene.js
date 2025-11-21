import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        this.music = this.registry.get('music') || this.registry.get('backgroundMusic');

        const settingsBox = this.add.image(0, 0, 'gui', 'settingsBox.png').setScale(0.4);
        const exit = this.add.image(155, -215, 'gui', "exit.png").setScale(0.05).setInteractive({ useHandCursor: true });
        const container = this.add.container(500, 300, [settingsBox, exit]).setAlpha(0).setVisible(false);

        const soundText = this.add.text(-40, -10, 'Sound', { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        container.add(soundText);

        const soundOn = this.add.image(0, 70, 'gui', "soundOn.png").setScale(0.1).setInteractive({ useHandCursor: true });
        const soundOff = this.add.image(0, 70, 'gui', "soundOff.png").setScale(0.1).setInteractive({ useHandCursor: true });

        [soundOn, soundOff].forEach(btn => {
            btn.on('pointerover', () => this.scaleUpBtn(btn, 0.12));
            btn.on('pointerout', () => this.scaleDownBtn(btn, 0.1));
        });

        this.updateSoundButtons(soundOn, soundOff);

        soundOn.on('pointerdown', () => {
            if (this.music && this.music.isPlaying) {
                this.music.stop();
                this.updateSoundButtons(soundOn, soundOff);
            }
        });

        soundOff.on('pointerdown', () => {
            if (this.music && !this.music.isPlaying) {
                this.music.play();
                this.updateSoundButtons(soundOn, soundOff);
            }
        });

        container.add([soundOn, soundOff]);

        const home = this.add.image(0, -80, 'gui', 'home.png').setScale(0.07).setInteractive({ useHandCursor: true });
        container.add(home);

        home.on('pointerover', () => this.scaleUpBtn(home, 0.09));
        home.on('pointerout', () => this.scaleDownBtn(home, 0.07));
        home.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop('ShopScene');
            this.scene.start('MainMenuScene');
        });

        const homeText = this.add.text(-40, -160, 'Home', { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        container.add(homeText);

        const settingsIcon = this.add.image(0, 589, 'gui', 'settingsIcon.png').setOrigin(0).setScale(0.05).setInteractive({ useHandCursor: true });

        let settingsVisible = false;
        settingsIcon.on('pointerdown', () => {
            settingsVisible = !settingsVisible;
            if (settingsVisible) {
                this.showSettings(container);
                this.updateSoundButtons(soundOn, soundOff);
            } else {
                this.hideSettings(container);
            }
        });

        exit.on('pointerdown', () => {
            this.hideSettings(container);
            settingsVisible = false;
        });
    }

    updateSoundButtons(soundOn, soundOff) {
        if (this.music) {
            const isPlaying = this.music.isPlaying;
            soundOn.setVisible(isPlaying);
            soundOff.setVisible(!isPlaying);
        } else {
            soundOn.setVisible(false);
            soundOff.setVisible(true);
        }
    }

    showSettings(obj) {
        obj.setVisible(true);
        this.tweens.add({
            targets: obj,
            alpha: 1,
            duration: 300,
            ease: 'Back.Out'
        });
    }

    hideSettings(obj) {
        this.tweens.add({
            targets: obj,
            alpha: 0,
            duration: 300,
            ease: 'Back.In',
            onComplete: () => obj.setVisible(false)
        });
    }

    scaleUpBtn(obj, scale) {
        this.tweens.add({ targets: obj, scale, duration: 150, ease: 'Power1' });
    }

    scaleDownBtn(obj, scale) {
        this.tweens.add({ targets: obj, scale, duration: 150, ease: 'Power2' });
    }
}