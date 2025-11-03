import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        //иконка сердца
        const heart = this.add.image(0,0, "gui", "gui_heart.png").setOrigin(0).setScale(2);
        // переменная хранящая количество сердец
        let heartCount = this.registry.get('hp');

        const coin = this.add.image(0,30, "gui", "gui_coin.png").setOrigin(0).setScale(2.1);
        const coinsCount = this.registry.get('coins');
        //текст худа
        WebFont.load({
            google: {
                families: ['Jacquard 12']
            },
            active: () => {
                const heartText = this.add.text(40, -10, `${heartCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });
                const coinText = this.add.text(35, 20, `${coinsCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });
                
            }
        
        })

        
    }

    update() {

    }
}