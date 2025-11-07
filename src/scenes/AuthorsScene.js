import Phaser from 'phaser';

export default class AuthorsScene extends Phaser.Scene {
    constructor() {
        super('AuthorsScene');
    }

    create() {
        const bg = this.add.image(0, 0, "walls").setOrigin(0).setScale(1.1);
        const exit = this.add.image(0,0,"exit").setOrigin(0).setScale(0.04).setInteractive({useHandCursor: true});
        exit.on('pointerdown', ()=>{
            this.scene.start('MainMenuScene');
        })
        
        WebFont.load({
            google: {
                families: ['Jacquard 12']
            },
            active: () => {
                const signTextT = this.add.text(225, 250, `Tymofii Sova`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
                const signTextJ = this.add.text(730, 250, `Jaroslav Tyrchenko`, { fontFamily: '"Jacquard 12"', fontSize: '22px', fill: '#ffffffff' });
                this.signInfoTextT = this.add.text(280, 400, `2A`, { fontFamily: '"Jacquard 12"', fontSize: '64px', fill: '#fff' }).setAlpha(0);
                this.signInfoTextJ = this.add.text(780, 400, `2A`, { fontFamily: '"Jacquard 12"', fontSize: '64px', fill: '#fff' }).setAlpha(0);

            }

        })

        const chains = this.add.image(270, 200, "chains").setOrigin(0).setScale(0.1).setAlpha(0);
        const signT = this.add.image(200, 200, "sign").setOrigin(0).setScale(0.15).setInteractive({useHandCursor: true});
        const signKlasaT = this.add.image(200, 300, "sign").setOrigin(0).setScale(0.15).setAlpha(0);
        signT.on('pointerdown', ()=>{
            this.showInfo(chains, signKlasaT, this.signInfoTextT);
        })
        const chains2 = this.add.image(760, 300, "chains").setOrigin(0).setScale(0.1).setAlpha(0);
        const signJ = this.add.image(700, 200, "sign").setOrigin(0).setScale(0.15).setInteractive({useHandCursor: true});
        const signKlasaJ = this.add.image(700, 300, "sign").setOrigin(0).setScale(0.15).setAlpha(0);
        signJ.on('pointerdown', ()=>{
            this.showInfo(chains2, signKlasaJ, this.signInfoTextJ);
        })
        
        

    }
    update() {

    }
    showInfo(chain, sign,text){
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