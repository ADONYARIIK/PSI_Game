import Phaser from 'phaser';
import { frameName, ITEM_PROPERTIES } from '../entities/consts';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.activeItems = [];
        this.shopItems = [];
        this.effectIcons = [];
        this.effectTooltips = [];
        this.currentTooltip = null;
        this.isShuttingDown = false;
    }

    create() {
        this.isShuttingDown = false;
        this.initializeUIElements();

        this.createInventorySlots();
        this.createShopSlots();
        this.createEffectsDisplay();
        this.updateInventory();
        this.updateShopItems();
    }

    initializeUIElements() {
        this.safeDestroy(this.heartText);
        this.safeDestroy(this.coinText);
        this.safeDestroy(this.lengthText);
        this.safeDestroy(this.scoreText);

        this.add.image(0, 0, "gui", "gui_heart.png").setOrigin(0).setScale(2);
        const heartsCount = this.registry.get('hp');

        this.add.image(0, 40, "gui", "gui_coin.png").setOrigin(0).setScale(2.1);
        const coinsCount = this.registry.get('coins');

        this.add.image(0, 80, 'sprites', 'snake_headRight.png').setOrigin(0).setScale(2);
        const lengthCount = this.registry.get('playerLength');

        this.heartText = this.add.text(40, -10, `${heartsCount}`, {
            fontFamily: '"Jacquard 12"',
            fontSize: '48px',
            fill: '#fff'
        });
        this.coinText = this.add.text(35, 30, `${coinsCount}`, {
            fontFamily: '"Jacquard 12"',
            fontSize: '48px',
            fill: '#fff'
        });
        this.lengthText = this.add.text(40, 70, `${lengthCount}`, {
            fontFamily: '"Jacquard 12"',
            fontSize: '48px',
            fill: '#fff'
        });

        const initialScores = this.registry.get('scores') || 0;
        this.scoresText = this.add.text(980, -10, this.formatScores(initialScores), {
            fontFamily: '"Jacquard 12"',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'right'
        }).setOrigin(0);

        this.registry.events.off('changedata');

        this.registry.events.on('changedata', (parent, key, data) => {
            if (this.isShuttingDown) return;

            if (key === 'hp' && this.heartText && this.heartText.active) {
                this.heartText.setText(`${data}`);
            }
            else if (key === 'coins' && this.coinText && this.coinText.active) {
                this.coinText.setText(`${data}`);
            }
            else if (key === 'playerLength' && this.lengthText && this.lengthText.active) {
                this.lengthText.setText(`${data}`);
            }
            else if (key === 'scores' && this.scoresText && this.scoresText.active) {
                this.scoresText.setText(this.formatScores(data));
            }
        });
    }

    formatScores(scores) {
        const scoreNum = parseInt(scores);
        return scoreNum.toString().padStart(8, '0');
    }

    createInventorySlots() {
        if (this.inventorySlots) {
            this.inventorySlots.forEach(slot => this.safeDestroy(slot));
        }
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

            const slotText = this.add.text(pos.x + 12, pos.y + 12, (index + 1).toString(), {
                fontSize: '16px',
                fill: '#000000'
            }).setOrigin(0.5);

            slot.on('pointerdown', () => {
                if (!this.isShuttingDown) {
                    this.useInventoryItem(index);
                }
            });

            this.inventorySlots.push(slot);
        });
    }

    updateInventory() {
        if (this.isShuttingDown) return;

        this.activeItems.forEach(item => this.safeDestroy(item));
        this.activeItems = [];

        const inventory = this.registry.get('playerInventory') || [null, null, null, null, null];

        inventory.forEach((item, index) => {
            if (this.isShuttingDown) return;

            const slot = this.inventorySlots[index];
            if (!slot || !item || !slot.active) return;

            let frame;
            let scale;

            if (item.type === 'potion') {
                frame = frameName(`${item.subType}_01`);
                scale = 2.5;
            } else {
                frame = frameName(item.subType);
                scale = 1.5;
            }

            try {
                const itemSprite = this.add.image(slot.x + 24, slot.y + 24, 'sprites', frameName(`${frame}`)).setScale(scale).setInteractive({ useHandCursor: true });

                itemSprite.itemData = item;
                itemSprite.slotIndex = index;

                itemSprite.on('pointerdown', (pointer) => {
                    if (this.isShuttingDown) return;

                    if (pointer.rightButtonDown()) {
                        this.showItemInfo(item, itemSprite.x, itemSprite.y);
                    } else {
                        this.useInventoryItem(index);
                    }
                });

                this.activeItems.push(itemSprite);
            } catch (error) {
                console.error('Error creating inventory item:', error);
            }
        });
    }

    useInventoryItem(index) {
        if (this.isShuttingDown) return;
        this.registry.events.emit('useInventoryItem', index);
    }

    showItemInfo(item, x, y) {
        if (this.isShuttingDown) return;

        try {
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
                this.safeDestroy(tooltip);
            });
        } catch (error) {
            console.error('Error showing item info:', error);
        }
    }

    getItemDescription(item) {
        try {
            const props = item.properties;
            let description = '';

            if (props.healthGain) description += `+${props.healthGain} HP \n`;
            if (props.maxHealthIncrease) description += `+${props.maxHealthIncrease} Max HP \n`;
            if (props.lengthGain) description += `+${props.lengthGain} Length `;
            if (props.shield) description += `Shield: ${props.shield} \n`;
            if (props.regen) description += `Regen: ${props.regen} \n`;
            if (props.damageBoost) description += `Dmg+: ${props.damageBoost} \n`;

            return description || 'No description';
        } catch (error) {
            return 'Error loading description';
        }
    }

    createEffectsDisplay() {
        this.safeDestroy(this.effectsContainer);

        this.effectsContainer = this.add.container(1075, 150);
        this.effectsContainer.setDepth(1000);
        this.effectsContainer.setScrollFactor(0);

        const effectsTitle = this.add.text(-100, -30, 'Active Effects', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0);

        this.effectsContainer.add(effectsTitle);

        this.effectIcons = [];
        this.effectTooltips = [];
    }

    updateEffects(effects) {
        if (this.isShuttingDown) return;

        if (!this.effectsContainer || !this.effectsContainer.active) {
            this.createEffectsDisplay();
        }

        this.effectIcons.forEach(icon => this.safeDestroy(icon.container));
        this.effectIcons = [];

        this.hideEffectTooltip();

        effects.forEach((effect, index) => {
            if (this.isShuttingDown) return;

            try {
                const x = -100 + (index * 45);
                const y = 10;

                let frame;
                let scale;

                const isPotion = effect.itemSubType && (
                    effect.itemSubType.includes('Flask') ||
                    effect.itemSubType === 'smallRedFlask' ||
                    effect.itemSubType === 'bigRedFlask' ||
                    effect.itemSubType === 'smallBlueFlask' ||
                    effect.itemSubType === 'bigBlueFlask'
                );

                if (isPotion) {
                    frame = frameName(`${effect.itemSubType}_01`);
                    scale = 2.5;
                } else {
                    frame = frameName(effect.itemSubType);
                    scale = 1.5;
                }

                const effectContainer = this.add.container(x, y);

                const effectIcon = this.add.image(0, 0, 'sprites', frame)
                    .setScale(scale)
                    .setInteractive({ useHandCursor: true });

                const turnsText = this.add.text(15, -15, effect.turnsLeft.toString(), {
                    fontSize: '14px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3,
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                effectContainer.add([effectIcon, turnsText]);
                this.effectsContainer.add(effectContainer);

                const effectData = {
                    container: effectContainer,
                    icon: effectIcon,
                    effect: effect
                };

                this.effectIcons.push(effectData);

                effectIcon.on('pointerover', () => {
                    if (!this.isShuttingDown) {
                        this.showEffectTooltip(effect, effectIcon);
                    }
                });
                effectIcon.on('pointerout', () => {
                    this.hideEffectTooltip();
                });
            } catch (error) {
                console.error('Error creating effect icon:', error);
            }
        });
    }

    showEffectTooltip(effect, icon) {
        if (this.isShuttingDown) return;

        this.hideEffectTooltip();

        try {
            const tooltip = this.add.container(icon.x + this.effectsContainer.x, icon.y + this.effectsContainer.y - 50);
            const background = this.add.graphics();
            background.fillStyle(0x000000, 0.9);
            background.fillRect(-80, -40, 160, 80);

            const nameText = this.add.text(0, -25, this.getEffectDisplayName(effect), {
                fontSize: '14px',
                fill: '#ffffff',
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const descText = this.add.text(0, -5, effect.description, {
                fontSize: '12px',
                fill: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);

            const turnsText = this.add.text(0, 15, `Turns left: ${effect.turnsLeft}`, {
                fontSize: '11px',
                fill: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);

            tooltip.add([background, nameText, descText, turnsText]);
            tooltip.setDepth(1001);
            tooltip.setScrollFactor(0);

            this.currentTooltip = tooltip;
        } catch (error) {
            console.error('Error showing effect tooltip:', error);
        }
    }

    hideEffectTooltip() {
        this.safeDestroy(this.currentTooltip);
        this.currentTooltip = null;
    }

    getEffectDisplayName(effect) {
        const names = {
            'regen': 'Regeneration',
            'shield': 'Shield',
            'damageBoost': 'Damage Boost',
            'vampireDamage': 'Vampire Damage',
            'doubleMove': 'Double Move'
        };

        return names[effect.type] || effect.type;
    }

    createShopSlots() {
        if (this.shopSlots) {
            this.shopSlots.forEach(slot => this.safeDestroy(slot));
        }
        this.shopSlots = [];

        if (this.shopSlotNumbers) {
            this.shopSlotNumbers.forEach(text => this.safeDestroy(text));
        }
        this.shopSlotNumbers = [];

        const slotPositions = [
            { x: 970, y: 40 },
            { x: 1020, y: 40 },
            { x: 1070, y: 40 }
        ];

        slotPositions.forEach((pos, index) => {
            const slot = this.add.image(pos.x, pos.y, 'gui', 'slot.png')
                .setOrigin(0)
                .setScale(2);

            const numberText = this.add.text(pos.x + 12, pos.y + 12, (index + 1).toString(), {
                fontSize: '16px',
                fill: '#000000'
            }).setOrigin(0.5);

            this.shopSlots.push(slot);
            this.shopSlotNumbers.push(numberText);
        });
    }

    updateShopItems() {
        if (this.isShuttingDown) return;

        this.shopItems.forEach(item => this.safeDestroy(item));
        this.shopItems = [];

        const purchasedItems = this.registry.get('playerItems') || [];

        purchasedItems.forEach((itemKey, index) => {
            if (this.isShuttingDown) return;

            const slot = this.shopSlots[index];
            if (!slot || !itemKey || !slot.active) return;

            const itemProperties = ITEM_PROPERTIES[itemKey];
            if (!itemProperties) return;

            let frame;
            let scale;

            if (itemProperties.type === 'potion') {
                frame = frameName(`${itemKey}_01`);
                scale = 2.5;
            } else {
                frame = frameName(itemKey);
                scale = 1.5;
            }

            try {
                const itemData = {
                    type: itemProperties.type,
                    subType: itemKey,
                    properties: itemProperties
                };

                const purchasedItem = this.add.image(slot.x + 24, slot.y + 24, 'sprites', frameName(`${frame}`)).setScale(scale).setInteractive({ useHandCursor: true });

                purchasedItem.itemData = itemData;
                purchasedItem.slotIndex = index;

                purchasedItem.on('pointerover', () => {
                    if (!this.isShuttingDown) {
                        this.showItemTooltip(purchasedItem, purchasedItem.x, purchasedItem.y + 40);
                    }
                });

                purchasedItem.on('pointerout', () => {
                    this.hideItemTooltip();
                });

                this.shopItems.push(purchasedItem);
            } catch (error) {
                console.error('Error creating shop item:', error);
            }
        });
    }

    showItemTooltip(sprite, x, y) {
        if (this.isShuttingDown) return;

        this.safeDestroy(sprite.tooltip);

        try {
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
        } catch (error) {
            console.error('Error showing item tooltip:', error);
        }
    }

    getShopItemDescription(properties) {
        try {
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
        } catch (error) {
            return 'Error loading description';
        }
    }

    hideItemTooltip() {
        this.shopItems.forEach(item => {
            this.safeDestroy(item.tooltip);
        });
    }

    safeDestroy(obj) {
        if (obj && obj.active) {
            if (obj.destroy) {
                obj.destroy();
            }
        }
    }

    shutdown() {
        this.isShuttingDown = true;

        this.registry.events.off('changedata');

        this.activeItems = [];
        this.shopItems = [];
        this.effectIcons = [];
        this.effectTooltips = [];

        this.hideEffectTooltip();
        this.hideItemTooltip();

        this.safeDestroy(this.heartText);
        this.safeDestroy(this.coinText);
        this.safeDestroy(this.lengthText);
        this.safeDestroy(this.scoresText);
        this.safeDestroy(this.effectsContainer);

        if (this.inventorySlots) {
            this.inventorySlots.forEach(slot => this.safeDestroy(slot));
            this.inventorySlots = [];
        }

        if (this.shopSlots) {
            this.shopSlots.forEach(slot => this.safeDestroy(slot));
            this.shopSlots = [];
        }

        if (this.shopSlotNumbers) {
            this.shopSlotNumbers.forEach(text => this.safeDestroy(text));
            this.shopSlotNumbers = [];
        }
    }
}