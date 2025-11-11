import Phaser from "phaser";

export default class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');

        // массивы для глобального использования в сцене
        this.items = [];         // все предметы магазина
        this.shopSlots = [];     // слоты для купленных предметов
        this.activeItems = [];   // предметы, которые уже куплены
    }

    create() {
        // фон магазина
        this.add.image(0, 0, 'gui', 'walls.png').setOrigin(0).setScale(1.1);

        // вывеска и анимации
        const shopSign = this.add.image(0, -100, 'gui', 'sign.png').setScale(0.1).setAlpha(0);
        const chains = this.add.image(-50, -300, 'gui', "chains.png").setOrigin(0).setScale(0.1).setAlpha(0);
        const shopText = this.add.text(-50, -100, 'SHOP', { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' }).setAlpha(0);
        this.add.container(550, 100, [shopSign, shopText, chains]);
        this.showInfo(chains, shopSign, shopText);

        // кнопка перехода на уровень
        const nextLvl = this.add.image(770, 570, 'gui', 'nextLvl.png').setScale(0.2).setInteractive({ useHandCursor: true });
        nextLvl.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        // создаём слоты для купленных предметов
        this.shopSlots = [
            this.add.image(1070, 0, 'gui', 'slot.png').setOrigin(0).setScale(2),
            this.add.image(1020, 0, 'gui', 'slot.png').setOrigin(0).setScale(2),
            this.add.image(970, 0, 'gui', 'slot.png').setOrigin(0).setScale(2)
        ];

        // создаём слоты для новых предметов в магазине
        const itemBoxesData = [
            { x: 150, y: 300 }, { x: 550, y: 300 }, { x: 950, y: 300 },
            { x: 150, y: 500 }, { x: 550, y: 500 }, { x: 950, y: 500 }
        ];

        itemBoxesData.forEach(pos => {
            const boxSprite = this.add.image(0, 0, 'gui', 'itemBox.png').setScale(0.2).setAlpha(0);
            const item = this.randItem();

            const container = this.add.container(pos.x, pos.y, [boxSprite, item]);
            this.items.push(item);

            // появление с анимацией
            this.tweens.add({
                targets: boxSprite,
                alpha: 1,
                duration: 300
            });

            // клик на предмет
            item.on('pointerdown', () => {
                const freeSlot = this.shopSlots.find(slot => !slot.hasItem);
                if (!freeSlot) return;

                freeSlot.hasItem = true;

                // сохраняем ключ предмета в registry
                const playerItems = this.registry.get('playerItems') || [];
                playerItems.push(item.frame.name);  // вот это
                this.registry.set('playerItems', playerItems);

                // удаляем предмет из контейнера магазина
                if (item.parentContainer) item.parentContainer.remove(item);

                // перемещаем предмет в слот
                this.children.bringToTop(item);
                item.x = freeSlot.x + 25;
                item.y = freeSlot.y + 25;

                // добавляем в активные предметы
                this.activeItems.push(item);
            });
        });

        // отображаем уже купленные предметы (если есть)
        const purchasedItems = this.registry.get('playerItems') || [];
        purchasedItems.forEach((itemKey, index) => {
            const slot = this.shopSlots[index];
            if (!slot) return;

            slot.hasItem = true;

            const purchasedItem = this.add.image(slot.x + 25, slot.y + 25, 'sprites', itemKey)
                .setScale(2)
                .setInteractive({ useHandCursor: true });

            this.activeItems.push(purchasedItem);
        });
    }

    randItem() {
        const itemKeys = [
            'garlic.png', 'espresso.png', 'smallBlueFlask_01.png',
            'bigRedFlask_01.png', 'bigBlueFlask_01.png', 'smallRedFlask_01.png', 'jalapeno.png'
        ];
        const randomKey = Phaser.Math.RND.pick(itemKeys);
        return this.add.image(0, 0, 'sprites', randomKey).setAlpha(1).setScale(2.5).setInteractive({ useHandCursor: true });
    }

    showInfo(chain, sign, text) {
        this.tweens.add({ targets: chain, y: -200, alpha: 1, duration: 1000, ease: 'Bounce.easeOut' });
        this.tweens.add({ targets: sign, y: 0, alpha: 1, duration: 1000, ease: 'Bounce.easeOut' });
        this.tweens.add({ targets: text, y: -15, alpha: 1, duration: 1000, ease: 'Bounce.easeOut' });
    }
}
