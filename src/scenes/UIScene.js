import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
         this.activeItems = [];
    }

    create() {
        //иконка сердца
        const heart = this.add.image(0, 0, "gui", "gui_heart.png").setOrigin(0).setScale(2);
        // переменная хранящая количество сердец
        let heartCount = this.registry.get('hp');

        const coin = this.add.image(0, 30, "gui", "gui_coin.png").setOrigin(0).setScale(2.1);
        const coinsCount = this.registry.get('coins');
        //текст худа

        const heartText = this.add.text(40, -10, `${heartCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });
        const coinText = this.add.text(35, 20, `${coinsCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });



        const key = this.add.image(0, 60, "gui", "gui_key1.png").setOrigin(0).setScale(2).setVisible(false);

        //переменная следящая за подбором предмета
        let keyPicked = false;

        this.activeItems.forEach(item => item.destroy());
        this.activeItems = [];

        // массив с боксами для предметов из магазина
        const shopItemsBox = [
            this.add.image(1070, 0, 'gui', 'player_frame_1.png').setOrigin(0).setScale(2),
            this.add.image(1020, 0, 'gui', 'player_frame_1.png').setOrigin(0).setScale(2),
            this.add.image(970, 0, 'gui', 'player_frame_1.png').setOrigin(0).setScale(2),
        ]


        // массив с боксами для предметов из инвентаря
        const inventoryItemsBox = [
            this.add.image(1070, 590, 'gui', 'player_frame_2.png').setOrigin(0).setScale(2),
            this.add.image(1020, 590, 'gui', 'player_frame_2.png').setOrigin(0).setScale(2),
            this.add.image(970, 590, 'gui', 'player_frame_2.png').setOrigin(0).setScale(2),
        ]


        const playerItems = this.registry.get('playerItems') || [];

        playerItems.forEach((itemKey, index) => {
            const slot = shopItemsBox[index];
            if (!slot) return;

            // создаём спрайт предмета в слоте
            const itemSprite = this.add.image(slot.x + 25, slot.y + 25, 'sprites', itemKey)
                .setScale(2)
                .setInteractive({ useHandCursor: true });
                this.activeItems.push(itemSprite);
        });


    }

    update() {
    }
}