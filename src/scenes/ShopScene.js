import Phaser from "phaser";
import { ITEM_PROPERTIES, SPAWN_WEIGHTS, frameName } from "../entities/consts";

export default class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
        this.shopItems = [];
    }

    create() {
        this.scene.launch('SettingsScene');
        this.scene.bringToTop('SettingsScene');
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        this.add.image(0, 0, 'gui', 'walls.png').setOrigin(0).setScale(1.1);

        const shopSign = this.add.image(0, -100, 'gui', 'sign.png').setScale(0.1).setAlpha(0);
        const chains = this.add.image(-50, -300, 'gui', "chains.png").setOrigin(0).setScale(0.1).setAlpha(0);
        const shopText = this.add.text(-50, -100, 'SHOP', {
            fontFamily: '"Jacquard 12"',
            fontSize: '32px',
            fill: '#ffffffff'
        }).setAlpha(0);

        this.add.container(550, 100, [shopSign, shopText, chains]);
        this.showInfo(chains, shopSign, shopText);

        const nextLvl = this.add.image(770, 570, 'gui', 'nextLvl.png')
            .setScale(0.2)
            .setInteractive({ useHandCursor: true });

        nextLvl.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.createShopSlots();
        this.createShopItems();
    }

    createShopSlots() {
        const slotPositions = [
            { x: 150, y: 300 },
            { x: 550, y: 300 },
            { x: 950, y: 300 },
            { x: 150, y: 500 },
            { x: 550, y: 500 },
            { x: 950, y: 500 }
        ]

        slotPositions.forEach((pos, index) => {
            const boxSprite = this.add.image(pos.x, pos.y, 'gui', 'itemBox.png')
                .setScale(0.2)
                .setAlpha(0);

            this.tweens.add({
                targets: boxSprite,
                alpha: 1,
                duretion: 300,
                delay: index * 100
            });
        });
    }

    createShopItems() {
        const weightedItems = [];

        SPAWN_WEIGHTS.food.forEach(food => {
            weightedItems.push({
                key: food.key,
                weight: food.weight
            });
        });

        SPAWN_WEIGHTS.potion.forEach(potion => {
            weightedItems.push({
                key: potion.key,
                weight: potion.weight
            });
        });

        const selectedItems = [];

        for (let i = 0; i < 6; i++) {
            const selectedItem = Phaser.Math.RND.weightedPick(weightedItems);
            selectedItems.push(selectedItem);
        }

        const itemPositions = [
            { x: 150, y: 300 },
            { x: 550, y: 300 },
            { x: 950, y: 300 },
            { x: 150, y: 500 },
            { x: 550, y: 500 },
            { x: 950, y: 500 }
        ];

        selectedItems.forEach((itemData, index) => {
            const itemKey = itemData.key;
            const pos = itemPositions[index];
            const itemProperties = ITEM_PROPERTIES[itemKey];

            let frame;
            let scale;

            if (itemProperties.type === 'potion') {
                frame = frameName(`${itemKey}_01`);
                scale = 3.5;
            } else {
                frame = frameName(itemKey);
                scale = 2.5;
            }

            const item = this.add.image(pos.x, pos.y, 'sprites', frame)
                .setScale(scale)
                .setAlpha(0)
                .setInteractive({ useHandCursor: true });

            item.itemKey = itemKey;
            item.itemProperties = itemProperties;

            this.tweens.add({
                targets: item,
                alpha: 1,
                duration: 500,
                delay: index * 150
            });

            item.on('pointerdown', () => {
                this.purchaseItem(item);
            });

            item.on('pointerover', () => {
                this.showItemTooltip(item, itemProperties);
            });

            item.on('pointerout', () => {
                this.hideItemTooltip();
            });

            this.shopItems.push(item);
        });
    }

    purchaseItem(item) {
        const playerItems = this.registry.get('playerItems') || [];

        if (playerItems.length >= 3) {
            this.showMessage('No space in inventory!', '#ff0000', item.x, item.y);
            return;
        }

        playerItems.push(item.itemKey);
        this.registry.set('playerItems', playerItems);

        this.scene.get('UIScene').updateShopItems();

        this.showMessage(`Purchased: ${item.itemKey}`, '#00ff00', item.x, item.y);

        this.tweens.add({
            targets: item,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => {
                item.destroy();
                this.shopItems = this.shopItems.filter(shopItem => shopItem !== item);
            }
        });
    }

    showItemTooltip(item, properties) {
        const tooltip = this.add.container(item.x, item.y - 80);
        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.8);
        background.fillRect(-80, -40, 160, 80);

        const nameText = this.add.text(0, -25, item.itemKey, {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const typeText = this.add.text(0, -5, `Type: ${properties.type}`, {
            fontSize: '12px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 15, this.getItemDescription(properties), {
            fontSize: '10px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);

        tooltip.add([background, nameText, typeText, descText]);
        tooltip.setDepth(1000);

        item.tooltip = tooltip;
    }

    hideItemTooltip() {
        this.shopItems.forEach(item => {
            if (item.tooltip) {
                item.tooltip.destroy();
                item.tooltip = null;
            }
        });
    }

    getItemDescription(properties) {
        let description = '';

        if (properties.healthGain) description += `+${properties.healthGain} HP `;
        if (properties.maxHealthIncrease) description += `+${properties.maxHealthIncrease} Max HP `;
        if (properties.lengthGain) description += `+${properties.lengthGain} Length `;
        if (properties.shield) description += `Shield: ${properties.shield} `;
        if (properties.regen) description += `Regen: ${properties.regen} `;
        if (properties.damageBoost) description += `Dmg+: ${properties.damageBoost} `;
        if (properties.doubleMove) description += `Double Move `;
        if (properties.vampireDamage) description += `Vampire Dmg: ${properties.vampireDamage} `;
        if (properties.permanentShield) description += `Perm Shield: ${properties.permanentShield} `;
        if (properties.damageReduction) description += `Dmg Reduction: ${properties.damageReduction} `;

        return description || 'No special effects';
    }

    showMessage(text, color, x, y) {
        const message = this.add.text(x, y, text, {
            fontSize: '20px',
            fill: color,
            backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(1001);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 20,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => message.destroy()
        });
    }

    showInfo(chain, sign, text) {
        this.tweens.add({
            targets: chain,
            y: -200,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
        this.tweens.add({
            targets: sign,
            y: 0,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
        this.tweens.add({
            targets: text,
            y: -15,
            alpha: 1,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
    }
}