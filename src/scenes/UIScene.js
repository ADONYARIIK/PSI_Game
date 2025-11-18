import Phaser from 'phaser';
import { frameName, ITEM_PROPERTIES } from '../entities/consts';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.activeItems = [];
        this.shopItems = [];
    }

    create() {
        this.add.image(0, 0, "gui", "gui_heart.png").setOrigin(0).setScale(2);
        this.heartsCount = this.registry.get('hp');

        this.add.image(0, 40, "gui", "gui_coin.png").setOrigin(0).setScale(2.1);
        this.coinsCount = this.registry.get('coins');

        this.add.image(0, 80, 'sprites', 'snake_headRight.png').setOrigin(0).setScale(2);
        this.lengthCount = this.registry.get('playerLength');

        this.heartText = this.add.text(40, -10, `${this.heartsCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });
        this.coinText = this.add.text(35, 30, `${this.coinsCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });
        this.lengthText = this.add.text(40, 70, `${this.lengthCount}`, { fontFamily: '"Jacquard 12"', fontSize: '48px', fill: '#fff' });

        this.registry.events.on('changedata', (parent, key, data) => {
            if (key === 'hp') {
                this.heartText.setText(`${data}`);
            } else if (key === 'coins') {
                this.coinText.setText(`${data}`);
            } else if (key === 'playerLength') {
                this.lengthText.setText(`${data}`);
            }
        })

        this.createInventorySlots();
        this.createShopSlots();
        this.createEffectsDisplay();
        this.updateInventory();
        this.updateShopItems();

        /*const key = this.add.image(0, 60, "gui", "gui_key1.png").setOrigin(0).setScale(2).setVisible(false);

        let keyPicked = false;

        this.activeItems.forEach(item => item.destroy());
        this.activeItems = [];

        const shopItemsBox = [
            this.add.image(1070, 0, 'gui', 'shopItem.png').setOrigin(0).setScale(2),
            this.add.image(1020, 0, 'gui', 'shopItem.png').setOrigin(0).setScale(2),
            this.add.image(970, 0, 'gui', 'shopItem.png').setOrigin(0).setScale(2),
        ]

        const inventoryItemsBox = [
            this.add.image(1070, 590, 'gui', 'slot.png').setOrigin(0).setScale(2),
            this.add.image(1020, 590, 'gui', 'slot.png').setOrigin(0).setScale(2),
            this.add.image(970, 590, 'gui', 'slot.png').setOrigin(0).setScale(2),
        ]

        const playerItems = this.registry.get('playerItems') || [];

        playerItems.forEach((itemKey, index) => {
            const slot = shopItemsBox[index];
            if (!slot) return;

            const itemSprite = this.add.image(slot.x + 25, slot.y + 25, 'sprites', itemKey)
                .setScale(2)
                .setInteractive({ useHandCursor: true });
            this.activeItems.push(itemSprite);
        });*/
    }

    createInventorySlots() {
        if (this.inventorySlots) this.inventorySlots.forEach(slot => slot.destroy());
        this.inventorySlots = [];

        const slotPositions = [
            { x: 870, y: 590 },
            { x: 920, y: 590 },
            { x: 970, y: 590 },
            { x: 1020, y: 590 },
            { x: 1070, y: 590 }
        ];

        slotPositions.forEach((pos, index) => {
            const slot = this.add.image(pos.x, pos.y, 'gui', 'slot.png').setOrigin(0).setScale(2).setInteractive({ useHandCursor: true });

            this.add.text(pos.x + 12, pos.y + 12, (index + 1).toString(), {
                fontSize: '16px',
                fill: '#000000'
            }).setOrigin(0.5);

            slot.on('pointerdown', () => {
                this.useInventoryItem(index);
            });

            this.inventorySlots.push(slot);
        })
    }

    updateInventory() {
        this.activeItems.forEach(item => item.destroy());
        this.activeItems = [];

        const inventory = this.registry.get('playerInventory') || [null, null, null, null, null];

        inventory.forEach((item, index) => {
            const slot = this.inventorySlots[index];
            if (!slot || !item) return;

            let frame;
            let scale;

            switch (item.subType) {
                case 'smallRedFlask':
                case 'bigRedFlask':
                case 'smallBlueFlask':
                case 'bigBlueFlask':
                    frame = `${item.subType}_01`;
                    scale = 2.5;
                    break;
                default:
                    frame = item.subType;
                    scale = 1.5;
            }

            const itemSprite = this.add.image(slot.x + 24, slot.y + 24, 'sprites', frameName(`${frame}`)).setScale(scale).setInteractive({ useHandCursor: true });

            itemSprite.itemData = item;
            itemSprite.slotIndex = index;

            itemSprite.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    this.showItemInfo(item, itemSprite.x, itemSprite.y);
                } else {
                    this.useInventoryItem(index);
                }
            });

            this.activeItems.push(itemSprite);
        });
    }



    useInventoryItem(index) {
        this.registry.events.emit('useInventoryItem', index);
    }

    showItemInfo(item, x, y) {
        const tooltip = this.add.container(x, y - 50);
        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.8);
        background.fillRect(-60, -30, 120, 60);

        const nameText = this.add.text(0, -15, item.subType, {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const typeText = this.add.text(0, 0, `Type: ${item.type}`, {
            fontSize: '12px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 15, this.getItemDescription(item), {
            fontSize: '10px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);

        tooltip.add([background, nameText, typeText, descText]);
        tooltip.setDepth(1000);

        this.time.delayedCall(3000, () => {
            tooltip.destroy();
        });
    }

    getItemDescription(item) {
        const props = item.properties;
        let description = '';

        if (props.healthGain) description += `+${props.healthGain} HP \n`;
        if (props.maxHealthIncrease) description += `+${props.maxHealthIncrease} Max HP \n`;
        if (props.lengthGain) description += `+${props.lengthGain} Length `;
        if (props.shield) description += `Shield: ${props.shield} \n`;
        if (props.regen) description += `Regen: ${props.regen} \n`;
        if (props.damageBoost) description += `Dmg+: ${props.damageBoost} \n`;

        return description || 'No description';
    }

    createEffectsDisplay() {
        this.effectsContainer = this.add.container(950, 0);

        const effectsBackground = this.add.rectangle(0, 0, 200, 100, 0x000000, 0.7).setOrigin(1, 0);
        this.effectsContainer.add(effectsBackground);

        const effectsTitle = this.add.text(-190, 5, 'Active Effects:', {
            fontSize: '14px',
            fill: '#ffffff'
        });
        this.effectsContainer.add(effectsTitle);

        this.effectsContainer.setDepth(1000);
        this.effectsContainer.setScrollFactor(0);
    }

    updateEffects(effects) {
        this.effectsContainer.getAll().forEach((child, index) => {
            if (index > 1) {
                child.destroy();
            }
        });

        effects.forEach((effect, index) => {
            const effectText = this.add.text(-190, 25 + (index * 16),
                `${effect.description} (${effect.turnsLeft})`, {
                fontSize: '12px',
                fill: this.getEffectColor(effect.type)
            });
            this.effectsContainer.add(effectText);
        });
    }

    getEffectColor(effectType) {
        const colors = {
            'regen': '#00ff00',
            'shield': '#0088ff',
            'damageBoost': '#ff4444',
            'vampireDamage': '#ff00ff',
            'doubleMove': '#ffff00'
        };
        return colors[effectType] || '#ffffff';
    }

    createShopSlots() {
        if (this.shopSlots) this.shopSlots.forEach(slot => slot.destroy());
        this.shopSlots = [];

        const slotPositions = [
            { x: 970, y: 0 },
            { x: 1020, y: 0 },
            { x: 1070, y: 0 }
        ];

        slotPositions.forEach((pos, index) => {
            const slot = this.add.image(pos.x, pos.y, 'gui', 'slot.png').setOrigin(0).setScale(2);

            this.add.text(pos.x + 12, pos.y + 12, (index + 1).toString(), {
                fontSize: '16px',
                fill: '#000000'
            }).setOrigin(0.5);

            this.shopSlots.push(slot);
        })
    }

    updateShopItems() {
        this.shopItems.forEach(item => item.destroy());
        this.shopItems = [];

        const purchasedItems = this.registry.get('playerItems') || [];

        purchasedItems.forEach((itemKey, index) => {
            const slot = this.shopSlots[index];
            if (!slot || !itemKey) return;

            const itemProperties = ITEM_PROPERTIES[itemKey];
            let frame;
            let scale;

            if (itemProperties.type === 'potion') {
                frame = frameName(`${itemKey}_01`);
                scale = 2.5;
            } else {
                frame = frameName(itemKey);
                scale = 1.5;
            }

            const itemData = {
                type: itemProperties.type,
                subType: itemKey,
                properties: itemProperties
            }

            const purchasedItem = this.add.image(slot.x + 24, slot.y + 24, 'sprites', frameName(`${frame}`)).setScale(scale).setInteractive({ useHandCursor: true });

            purchasedItem.itemData = itemData;
            purchasedItem.slotIndex = index;


            purchasedItem.on('pointerover', () => {
                this.showItemTooltip(purchasedItem, purchasedItem.x, purchasedItem.y + 40);
            });

            purchasedItem.on('pointerout', () => {
                this.hideItemTooltip();
            });

            this.shopItems.push(purchasedItem);
        })
    }

    showItemTooltip(sprite, x, y) {
        if (sprite.tooltip) {
            sprite.tooltip.destroy();
            sprite.tooltip = null;
        }

        const itemData = sprite.itemData;  

       const tooltip = this.add.container(x - 30, y + 20);

        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.8);
        background.fillRect(-80, -40, 160, 80);

        const nameText = this.add.text(0, -25, itemData.subType || 'Unknown', {
            fontSize: '14px',
            fill: '#ffffff',
        }).setOrigin(0.5);

        const typeText = this.add.text(0, -5, `Type: ${itemData.type || '—'}`, {
            fontSize: '12px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 15, this.getShopItemDescription(itemData.properties), {
            fontSize: '10px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);

        tooltip.add([background, nameText, typeText, descText]);

        tooltip.setDepth(2000);

        sprite.tooltip = tooltip;
    }

    getShopItemDescription(properties) {
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
    hideItemTooltip() {
        this.shopItems.forEach(item => {
            if (item.tooltip) {
                item.tooltip.destroy();
                item.tooltip = null;
            }
        });
    }
}