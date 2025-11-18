import Phaser from 'phaser';
import TurnManager from '../systems/TurnManager.js';
import { Directions } from '../entities/consts.js';
import { generateMap } from '../generation/MapGenerator.js';
import { createSnake } from '../utils/createHelper.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.items = [];
        this.enemies = [];
        this.exits = [];
        this.playerInventory = [];
        this.activeEffects = [];
        this.floatingTextQueue = [];
        this.isShowingFloatingText = false;
        this.isGameOver = false;
    }

    create() {
        this.scene.launch('SettingsScene');
        this.scene.bringToTop('SettingsScene');
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setScrollFactor(0);
        overlay.setDepth(999);

        // this.mapData = generateMap(this, Phaser.Math.Between(5, 15));
        this.mapData = generateMap(this, 3);

        this.mapTiles = this.mapData.mapTiles;

        if (!this.mapData.start) {
            console.error('No start room found in map data');
            return;
        }

        this.player = createSnake(this, this.mapData.start, 'Right');

        if (!this.player) {
            console.error('Failed to create snake');
            return;
        }

        this.cameras.main.setBounds(
            this.mapData.bounds.left,
            this.mapData.bounds.top,
            this.mapData.bounds.width,
            this.mapData.bounds.height
        );

        // this.cameras.main.startFollow(this.player.headSprite);
        this.cameras.main.setZoom(2.5);

        // this.cameras.main.zoom = 1;
        // this.cameras.main.zoom = 1.5;
        // this.cameras.main.setScroll(0, 0);

        // console.log('Camera bounds:', this.cameras.main.getBounds());
        // console.log('Snake position:', this.player.headSprite.x, this.player.headSprite.y);
        // console.log('Start room:', mapData.start);

        if (!this.items) this.items = [];
        if (!this.enemies) this.enemies = [];

        this.turnManager = new TurnManager(this, this.player, this.enemies);

        this.registry.events.on('useInventoryItem', (index) => {
            this.useInventoryItem(index);
        });

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.input.keyboard.on('keydown', (event) => {
            if (this.turnManager.locked) return;
            // console.log('Key pressed:', event.code);

            let dir = null;
            switch (event.code) {
                case 'KeyW': dir = Directions.UP; break;
                case 'KeyS': dir = Directions.DOWN; break;
                case 'KeyA': dir = Directions.LEFT; break;
                case 'KeyD': dir = Directions.RIGHT; break;
            }

            if (!dir) return;

            this.player.enqueueDirection(dir);

            this.turnManager.processTurn(dir, {
                isWallAt: (worldX, worldY) => {
                    const gridX = Math.round(worldX);
                    const gridY = Math.round(worldY);

                    const tileKey = `${gridX},${gridY}`;
                    const tile = this.mapData.mapTiles[tileKey];

                    if (tile === '#') {
                        console.log(`Wall collision at (${gridX},${gridY})`);
                        this.gameOver();
                        return true;
                    }

                    return false;
                },
                getEntityAt: (worldX, worldY) => {
                    const exit = this.exits.find(e => e.gridX === worldX && e.gridY === worldY);
                    if (exit) {
                        console.log(`Found exit at grid(${worldX},${worldY})`);
                        return exit;
                    }

                    const item = this.items.find(it => {
                        const itemGridX = it.gridX;
                        const itemGridY = it.gridY;
                        const match = itemGridX === worldX && itemGridY === worldY;
                        if (match) console.log(`Found item: ${it.type} at grid(${itemGridX},${itemGridY})`);
                        return match;
                    });
                    if (item) return item;

                    const enemy = this.enemies.find(e => {
                        const enemyGridX = e.gridX;
                        const enemyGridY = e.gridY;
                        const match = enemyGridX === worldX && enemyGridY === worldY;
                        if (match) console.log(`Found enemy: ${e.subType} at grid(${enemyGridX},${enemyGridY})`);
                        return match;
                    });
                    if (enemy) return enemy;

                    return null;
                },
                onEat: (item) => {
                    console.log(`Eating item: ${item.type}`);

                    if (item.type === 'exit') {
                        this.completeLevel();
                        return;
                    }

                    this.handleItemCollection(item);
                },
                onCollide: (entity) => {
                    console.log(`Collision with: ${entity.type} ${entity.subType}`);

                    if (entity.type === 'exit') {
                        this.completeLevel();
                        return;
                    }

                    this.handleEnemyCollision(entity);
                },
                getPlayerHead: () => ({
                    x: this.player.segments[0].x,
                    y: this.player.segments[0].y
                })
            });
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameraSpeed = 10;
    }

    update() {
        this.registry.set('playerLength', this.player.getLength());

        const cam = this.cameras.main;

        if (this.cursors.left.isDown) {
            cam.scrollX -= this.cameraSpeed;
        } else if (this.cursors.right.isDown) {
            cam.scrollX += this.cameraSpeed;
        }

        if (this.cursors.up.isDown) {
            cam.scrollY -= this.cameraSpeed;
        } else if (this.cursors.down.isDown) {
            cam.scrollY += this.cameraSpeed;
        }
    }

    isWall(gridX, gridY) {
        const tileKey = `${gridX},${gridY}`;
        const tile = this.mapData.mapTiles[tileKey];
        return tile === '#';
    }

    useInventoryItem(index) {
        const inventory = this.registry.get('playerInventory') || [null, null, null, null, null];

        if (index < 0 || index >= inventory.length || !inventory[index]) return;

        const item = inventory[index];

        this.applyItemEffects({
            type: item.type,
            subType: item.subType,
            ...item.properties
        });

        inventory[index] = null;
        this.registry.set('playerInventory', inventory);

        this.scene.get('UIScene').updateInventory();
        console.log(`Used inventory item: ${item.subType}`);
    }

    handleItemCollection(item) {
        if (item.type === 'coin') {
            this.registry.set('coins', this.registry.get('coins') + item.value);
            this.registry.set('scores', this.registry.get('scores') + 5);
            this.showFloatingText(`+${item.value}`, 'yellow');
            item.destroy();
            this.items = this.items.filter(i => i !== item);
            return;
        }

        if (item.immediate) {
            this.applyItemEffects(item);
            this.showFloatingText('+', 'yellow');
            item.destroy();
            this.items = this.items.filter(i => i !== item);
        } else {
            const inventory = this.registry.get('playerInventory') || [null, null, null, null, null];
            const emptySlotIndex = inventory.findIndex(slot => slot === null);

            if (emptySlotIndex === -1) {
                this.showFloatingText('Inventory full!', 'red', item.x, item.y);
                return;
            }

            inventory[emptySlotIndex] = {
                type: item.type,
                subType: item.subType,
                properties: this.getItemProperties(item)
            };
            this.registry.set('playerInventory', inventory);

            switch (item.subType) {
                case 'smallRedFlask':
                    this.showFloatingText('+Small Red Flask', 'yellow');
                    break;
                case 'bigRedFlask':
                    this.showFloatingText('+Big Red Flask', 'yellow');
                    break;
                case 'smallBlueFlask':
                    this.showFloatingText('+Small Blue Flask', 'yellow');
                    break;
                case 'bigBlueFlask':
                    this.showFloatingText('+Big Blue Flask', 'yellow');
                    break;
                default:
                    this.showFloatingText(`+${item.subType}`, 'yellow');
            }

            item.destroy();
            this.items = this.items.filter(i => i !== item);
            this.scene.get('UIScene').updateInventory();
        }
    }

    getItemProperties(item) {
        const props = {};
        if (item.healthGain) props.healthGain = item.healthGain;
        if (item.maxHealthIncrease) props.maxHealthIncrease = item.maxHealthIncrease;
        if (item.lengthGain) props.lengthGain = item.lengthGain;
        if (item.shield) props.shield = item.shield;
        if (item.shieldDuration) props.shieldDuration = item.shieldDuration;
        if (item.regen) props.regen = item.regen;
        if (item.regenDuration) props.regenDuration = item.regenDuration;
        if (item.doubleMove) props.doubleMove = item.doubleMove;
        if (item.doubleMoveDuration) props.doubleMoveDuration = item.doubleMoveDuration;
        if (item.healthLoss) props.healthLoss = item.healthLoss;
        if (item.vampireDamage) props.vampireDamage = item.vampireDamage;
        if (item.vampireDuration) props.vampireDuration = item.vampireDuration;
        if (item.damageBoost) props.damageBoost = item.damageBoost;
        if (item.damageDuration) props.damageDuration = item.damageDuration;
        if (item.lengthLoss) props.lengthLoss = item.lengthLoss;
        if (item.tempLength) props.tempLength = item.tempLength;
        if (item.tempLengthDuration) props.tempLengthDuration = item.tempLengthDuration;
        if (item.permanentShield) props.permanentShield = item.permanentShield;
        if (item.damageReduction) props.damageReduction = item.damageReduction;
        if (item.keyType) props.keyType = item.keyType;

        return props;
    }

    applyItemEffects(item) {
        const effects = [];

        if (item.keyType) {
            if (item.keyType === 'silver') {
                this.registry.set('silverKeys', this.registry.get('silverKeys') + 1);
                effects.push({ text: `+Silver Key`, color: 'silver' })
            } else if (item.keyType === 'gold') {
                this.registry.set('goldKeys', this.registry.get('goldKeys') + 1);
                effects.push({ text: `+Gold Key`, color: 'gold' })
            }
            return;
        }

        if (item.healthGain) {
            const currentHP = this.registry.get('hp');
            const maxHP = this.registry.get('maxHP');
            this.registry.set('hp', Math.min(maxHP, currentHP + item.healthGain));
            effects.push({ text: `+${item.healthGain} HP`, color: 'green' })
        }

        if (item.maxHealthIncrease) {
            const currentMaxHP = this.registry.get('maxHP');
            this.registry.set('maxHP', currentMaxHP + item.maxHealthIncrease);
            effects.push({ text: `Max HP +${item.maxHealthIncrease}`, color: 'yellow' })
        }

        if (item.lengthGain) {
            this.player.grow += item.lengthGain;
            this.registry.set('playerLength', this.player.getLength());
            effects.push({ text: `Length +${item.lengthGain}`, color: 'cyan' })
        }

        if (item.healthLoss) {
            const currentHP = this.registry.get('hp');
            this.registry.set('hp', Math.max(1, currentHP - item.healthLoss));
            effects.push({ text: `-${item.healthLoss} HP`, color: 'red' })
        }

        if (item.lengthLoss) {
            this.player.grow = Math.max(0, this.player.grow - item.lengthLoss);
            if (this.player.grow === 0 && this.player.segments.length > 3) {
                const segmentsToRemove = Math.min(item.lengthLoss, this.player.getLength() - 3);
                for (let i = 0; i < segmentsToRemove; i++) {
                    this.player.segments.pop();
                }
                this.player.syncSpritesToSegments();
            }
            this.registry.set('playerLength', this.player.getLength());
            effects.push({ text: `Length -${item.lengthLoss}`, color: 'orange' })
        }

        if (item.tempLength && item.tempLengthDuration) {
            this.player.grow += item.tempLength;
            this.tempLengthSegments = item.tempLength;
            this.tempLengthDuration = item.tempLengthDuration;
            this.registry.set('playerLength', this.player.getLength());
            this.activeEffects.push({
                type: 'tempLength',
                value: item.tempLength,
                duration: item.tempLengthDuration,
                turnsLeft: item.tempLengthDuration,
                description: `Temp Length +${item.tempLength}`,
                itemSubType: item.subType
            });
            effects.push({ text: `Temp Length +${item.tempLength}`, color: 'lightblue' })
        }

        if (item.regen && item.regenDuration) {
            this.activeEffects.push({
                type: 'regen',
                value: item.regen,
                duration: item.regenDuration,
                turnsLeft: item.regenDuration,
                description: `Regen +${item.regen} HP/turn`,
                itemSubType: item.subType
            });
            effects.push({ text: `Regen +${item.regen}/turn`, color: 'lime' })
        }

        if (item.shield && item.shieldDuration) {
            this.activeEffects.push({
                type: 'shield',
                value: item.shield,
                duration: item.shieldDuration,
                turnsLeft: item.shieldDuration,
                description: `Shield +${item.shield}`,
                itemSubType: item.subType
            })
            effects.push({ text: `Shield +${item.shield}`, color: 'blue' })
        }

        if (item.permanentShield) {
            const currentShield = this.registry.get('permanentShield') || 0;
            this.registry.set('permanentShield', currentShield + item.permanentShield);
            effects.push({ text: `Permanent Shield +${item.permanentShield}`, color: 'darkblue' })
        }

        if (item.damageReduction) {
            const currentDmg = this.registry.get('dmg');
            this.registry.set('dmg', Math.max(1, currentDmg - item.damageReduction));
            effects.push({ text: `Damage -${item.damageReduction}`, color: 'purple' })
        }

        if (item.damageBoost && item.damageDuration) {
            this.activeEffects.push({
                type: 'damageBoost',
                value: item.damageBoost,
                duration: item.damageDuration,
                turnsLeft: item.damageDuration,
                description: `Dmg +${item.damageBoost}`,
                itemSubType: item.subType
            });
            effects.push({ text: `Damage +${item.damageBoost}`, color: 'red' })
        }

        if (item.vampireDamage && item.vampireDuration) {
            this.activeEffects.push({
                type: 'vampireDamage',
                value: item.vampireDamage,
                duration: item.vampireDuration,
                turnsLeft: item.vampireDuration,
                description: `Vampire Dmg +${item.vampireDamage}`,
                itemSubType: item.subType
            });
            effects.push({ text: `Vampire Damage +${item.vampireDamage}`, color: 'darkred' })
        }

        if (item.doubleMove && item.doubleMoveDuration) {
            this.activeEffects.push({
                type: 'doubleMove',
                value: true,
                duration: item.doubleMoveDuration,
                turnsLeft: item.doubleMoveDuration,
                description: 'Double Move',
                itemSubType: item.subType
            });
            effects.push({ text: 'Double Move!', color: 'gold' })
        }

        effects.forEach(effect => {
            this.showFloatingText(effect.text, effect.color);
        });

        this.registry.set('scores', this.registry.get('scores') + 10);
        this.updateEffectsUI();
    }

    processEndOfTurnEffects() {
        const regenEffects = this.activeEffects.filter(effect => effect.type === 'regen');
        regenEffects.forEach(effect => {
            const currentHP = this.registry.get('hp');
            const maxHP = this.registry.get('maxHP');
            const healAmount = Math.min(effect.value, maxHP - currentHP);
            if (healAmount > 0) {
                this.registry.set('hp', currentHP + healAmount);
                this.showFloatingText(`Regen +${healAmount}`, 'lime');
            }
        });

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            this.activeEffects[i].turnsLeft--;

            if (this.activeEffects[i].turnsLeft <= 0) {
                const expiredEffect = this.activeEffects[i];

                if (expiredEffect.type === 'damageBoost') {
                    this.showFloatingText('Damage boost ended', 'white');
                } else if (expiredEffect.type === 'shield') {
                    this.showFloatingText('Shield ended', 'white');
                } else if (expiredEffect.type === 'doubleMove') {
                    this.showFloatingText('Double move ended', 'white');
                } else if (expiredEffect.type === 'vampireDamage') {
                    this.showFloatingText('Vampire damage ended', 'white');
                }

                this.activeEffects.splice(i, 1);
            }
        }

        if (this.tempLengthDuration > 0) {
            this.tempLengthDuration--;
            if (this.tempLengthDuration <= 0 && this.tempLengthSegments > 0) {
                const segmentsToRemove = Math.min(this.tempLengthSegments, this.player.getLength() - 3);

                for (let i = 0; i < segmentsToRemove; i++) {
                    this.player.segments.pop();
                }
                this.player.syncSpritesToSegments();
                this.tempLengthSegments = 0;
                this.registry.set('playerLength', this.player.getLength());
                this.showFloatingText('Temp length ended', 'white');
            }
        }

        this.updateEffectsUI();
    }

    updateEffectsUI() {
        if (this.scene.get('UIScene')) {
            this.scene.get('UIScene').updateEffects(this.activeEffects);
        }
    }

    getPlayerDamage() {
        let damage = this.registry.get('dmg');

        const damageBoost = this.activeEffects.find(effect => effect.type === 'damageBoost');
        if (damageBoost) {
            damage += damageBoost.value;
        }

        return damage;
    }

    getPlayerShield() {
        let shield = this.registry.get('permanentShield') || 0;

        const shieldEffect = this.activeEffects.find(effect => effect.type === 'shield');
        if (shieldEffect) {
            shield += shieldEffect.value;
        }

        return shield;
    }

    getVampireDamageBonus() {
        const vampireEffect = this.activeEffects.find(effect => effect.type === 'vampireDamage');
        return vampireEffect ? vampireEffect.value : 0;
    }

    hasDoubleMove() {
        return this.activeEffects.some(effect => effect.type === 'doubleMove');
    }

    showFloatingText(text, color = 'ffffff', x = null, y = null) {
        this.floatingTextQueue.push({
            text: text.toString(),
            color: color,
            x: x !== null ? x : this.player.headSprite.x + 3,
            y: y !== null ? y : this.player.headSprite.y - 10
        })

        if (!this.isShowingFloatingText) {
            this.processFloatingTextQueue();
        }
    }

    processFloatingTextQueue() {
        if (this.floatingTextQueue.length === 0) {
            this.isShowingFloatingText = false;
            return;
        }

        this.isShowingFloatingText = true;
        const message = this.floatingTextQueue.shift();

        const floatingText = this.add.text(message.x, message.y, message.text, {
            fontSize: '12px',
            fill: message.color,
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(100);

        this.tweens.add({
            targets: floatingText,
            y: message.y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy();
                this.processFloatingTextQueue();
            }
        });
    }

    handleEnemyCollision(enemy) {
        const playerDamage = this.getPlayerDamage();
        let totalDamage = playerDamage;

        if (enemy.subType && enemy.subType === 'vampire') {
            totalDamage += this.getVampireDamageBonus();
        }

        const actualDamage = Math.max(1, totalDamage - (enemy.shield || 0));
        enemy.health -= actualDamage;

        this.showFloatingText(`HP -${actualDamage}`, '#ff4444', enemy.x, enemy.y);

        if (enemy.getData('updateHealthBar')) {
            enemy.getData('updateHealthBar')();
        }

        if (enemy.health <= 0) {
            // this.showDeathEffect(enemy.x, enemy.y);
            enemy.destroy();
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.registry.set('scores', this.registry.get('scores') + 30);
        } else {
            let enemyDamage = enemy.damage;
            const playerShield = this.getPlayerShield();

            enemyDamage = Math.max(0, enemyDamage - playerShield);

            if (enemyDamage > 0) {
                this.registry.set('hp', this.registry.get('hp') - enemyDamage);

                this.time.delayedCall(400, () => {
                    this.showFloatingText(`HP -${enemyDamage}`, '#ff0000');
                });

                if (enemy.lifesteal) {
                    this.time.delayedCall(800, () => {
                        enemy.health = Math.min(enemy.maxHealth, enemy.health + 1);
                        this.showFloatingText('+1 HP', '#ff00ff', enemy.x, enemy.y);
                    });
                }

                this.cameras.main.shake(100, 0.01);

                if (this.registry.get('hp') <= 0) {
                    this.gameOver();
                }
            } else {
                this.time.delayedCall(400, () => {
                    this.showFloatingText('Blocked!', '#00ffff');
                });
            }
        }
    }

    // showDeathEffect(x, y) {
    //     const particles = this.add.particles('sprites');

    //     const emitter = particles.createEmitter({
    //         frame: 'skull_01.png',
    //         x: x + 8,
    //         y: y + 8,
    //         speed: { min: 20, max: 50 },
    //         angle: { min: 0, max: 360 },
    //         scale: { start: 0.5, end: 0 },
    //         lifespan: 800,
    //         quantity: 5
    //     });

    //     this.time.delayedCall(800, () => {
    //         particles.destroy();
    //     });
    // }


    completeLevel() {
        console.log('Level completed! Going to shop...');

        this.registry.set('level', this.registry.get('level') + 1);

        this.showFloatingText('Level Complete!', 'gold', this.player.headSprite.x, this.player.headSprite.y - 20);

        this.time.delayedCall(1000, () => {
            this.scene.start('ShopScene');
        });
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        console.log('Game Over - Player died');

        this.scene.launch('GameOverScene');
        this.scene.bringToTop('GameOverScene');
    }
}