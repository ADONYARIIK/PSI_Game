import Phaser from 'phaser';

export default class AuthorsScene extends Phaser.Scene {
    constructor() {
        super('AuthorsScene');
    }

    create() {
        const bg = this.add.image(0, 0, 'gui', "walls.png").setOrigin(0).setScale(1.1);
        const exit = this.add.image(0, 0, 'gui', "exit.png").setOrigin(0).setScale(0.04).setInteractive({ useHandCursor: true });
        exit.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        })

        const chains = this.add.image(270, 200, 'gui', "chains.png").setOrigin(0).setScale(0.1).setAlpha(0);
        const signT = this.add.image(200, 200, 'gui', "sign.png").setOrigin(0).setScale(0.15).setInteractive({ useHandCursor: true });
        const signKlasaT = this.add.image(200, 300, 'gui', "sign.png").setOrigin(0).setScale(0.15).setAlpha(0);
        signT.on('pointerdown', () => {
            this.showInfo(chains, signKlasaT, signInfoTextT);
        })

        const chains2 = this.add.image(760, 300, 'gui', "chains.png").setOrigin(0).setScale(0.1).setAlpha(0);
        const signJ = this.add.image(700, 200, 'gui', "sign.png").setOrigin(0).setScale(0.15).setInteractive({ useHandCursor: true });
        const signKlasaJ = this.add.image(700, 300, 'gui', "sign.png").setOrigin(0).setScale(0.15).setAlpha(0);
        signJ.on('pointerdown', () => {
            this.showInfo(chains2, signKlasaJ, signInfoTextJ);
        })

        const signTextT = this.add.text(225, 250, `Tymofii Sova`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        const signTextJ = this.add.text(730, 250, `Jaroslav Tyrchenko`, { fontFamily: '"Jacquard 12"', fontSize: '22px', fill: '#ffffffff' });
        const signInfoTextT = this.add.text(280, 400, `2A`, { fontFamily: '"Jacquard 12"', fontSize: '64px', fill: '#fff' }).setAlpha(0);
        const signInfoTextJ = this.add.text(780, 400, `2A`, { fontFamily: '"Jacquard 12"', fontSize: '64px', fill: '#fff' }).setAlpha(0);



    }
    update() {

    }
    showInfo(chain, sign, text) {
        this.tweens.add({
            targets: chain,
            y: 300,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
        this.tweens.add({
            targets: sign,
            y: 450,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
        this.tweens.add({
            targets: text,
            y: 500,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
    }
}