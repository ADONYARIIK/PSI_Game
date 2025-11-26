import Phaser from 'phaser';
import TurnManager from '../systems/TurnManager.js';
import { Directions, ITEM_PROPERTIES, TILE_SIZE, frameName } from '../entities/consts.js';
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
    }

    create() {
        this.lastLength = this.registry.get('playerLength');

        console.log(this.registry.get('level'), this.registry.get('coins'), this.registry.get('playerLength'), this.registry.get('scores'));

        this.scene.launch('SettingsScene');
        this.scene.bringToTop('SettingsScene');
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setScrollFactor(0);
        overlay.setDepth(999);

        const roomCount = Math.min(3 + this.registry.get('level') * 2, 15);
        this.mapData = generateMap(this, roomCount);

        this.mapTiles = this.mapData.mapTiles;

        if (!this.mapData.start) {
            console.error('No start room found in map data');
            return;
        }

        this.rooms = this.mapData.rooms;

        this.player = createSnake(this, this.mapData.start, 'Right', this.registry.get('length'));

        if (!this.player) {
            console.error('Failed to create snake');
            return;
        }

        this.spawnShopItems();

        this.recalculateStats();

        this.cameras.main.setBounds(
            this.mapData.bounds.left,
            this.mapData.bounds.top,
            this.mapData.bounds.width,
            this.mapData.bounds.height
        );

        this.cameras.main.startFollow(this.player.headSprite, false, 0.05, 0.05);
        this.cameras.main.setZoom(2.5);

        if (!this.items) this.items = [];
        if (!this.enemies) this.enemies = [];

        this.enemies.forEach(enemy => {
            enemy.isBeingProcessed = false;
        });

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

            let dir = null;
            switch (event.code) {
                case 'KeyW': dir = Directions.UP; break;
                case 'KeyS': dir = Directions.DOWN; break;
                case 'KeyA': dir = Directions.LEFT; break;
                case 'KeyD': dir = Directions.RIGHT; break;
            }

            if (!dir) return;

            this.player.enqueueDirection(dir);

            if (this.hasDoubleMove()) {
                this.processDoubleMoveTurn(dir, {
                    isWallAt: (worldX, worldY) => {
                        const gridX = Math.round(worldX);
                        const gridY = Math.round(worldY);
                        const tileKey = `${gridX},${gridY}`;
                        const tile = this.mapData.mapTiles[tileKey];
                        return tile === '#';
                    },
                    getEntityAt: (worldX, worldY) => {
                        const exit = this.exits.find(e => e.gridX === worldX && e.gridY === worldY);
                        if (exit) return exit;

                        const enemy = this.enemies.find(e =>
                            e.gridX === worldX && e.gridY === worldY && e.active
                        );
                        if (enemy) return enemy;

                        const item = this.items.find(it => it.gridX === worldX && it.gridY === worldY);
                        if (item) return item;

                        return null;
                    },
                    getEnemyAt: (x, y, excludeEnemy = null) => {
                        return this.enemies.find(e =>
                            e.gridX === x && e.gridY === y && e !== excludeEnemy && e.active
                        );
                    },
                    onEat: (item) => {
                        if (item.type === 'exit') {
                            this.completeLevel();
                            return;
                        }
                        this.handleItemCollection(item);
                    },
                    onCollide: (entity) => {
                        if (entity.type === 'exit') {
                            this.completeLevel();
                            return;
                        }
                        this.handleEnemyCollision(entity);
                    },
                    getPlayerHead: () => ({
                        x: this.player.segments[0].x,
                        y: this.player.segments[0].y
                    }),
                    isSnakeAt: (x, y) => {
                        return this.player.occupancy.has(`${x},${y}`);
                    },
                    onEnemyAttack: (enemy) => {
                        this.handleEnemyAttack(enemy);
                    },
                    onSelfCollision: () => {
                        console.log('Self collision detected!');
                        this.gameOver();
                    },
                    onWallCollision: () => {
                        console.log('Wall collision detected!');
                        this.gameOver();
                    },
                    skipEnemyTurn: false
                });
            } else {
                this.turnManager.processTurn(dir, {
                    isWallAt: (worldX, worldY) => {
                        const gridX = Math.round(worldX);
                        const gridY = Math.round(worldY);
                        const tileKey = `${gridX},${gridY}`;
                        const tile = this.mapData.mapTiles[tileKey];
                        return tile === '#';
                    },
                    getEntityAt: (worldX, worldY) => {
                        const exit = this.exits.find(e => e.gridX === worldX && e.gridY === worldY);
                        if (exit) return exit;

                        const enemy = this.enemies.find(e =>
                            e.gridX === worldX && e.gridY === worldY && e.active
                        );
                        if (enemy) return enemy;

                        const item = this.items.find(it => it.gridX === worldX && it.gridY === worldY);
                        if (item) return item;

                        return null;
                    },
                    getEnemyAt: (x, y, excludeEnemy = null) => {
                        return this.enemies.find(e =>
                            e.gridX === x && e.gridY === y && e !== excludeEnemy && e.active
                        );
                    },
                    onEat: (item) => {
                        if (item.type === 'exit') {
                            this.completeLevel();
                            return;
                        }
                        this.handleItemCollection(item);
                    },
                    onCollide: (entity) => {
                        if (entity.type === 'exit') {
                            this.completeLevel();
                            return;
                        }
                        this.handleEnemyCollision(entity);
                    },
                    getPlayerHead: () => ({
                        x: this.player.segments[0].x,
                        y: this.player.segments[0].y
                    }),
                    isSnakeAt: (x, y) => {
                        return this.player.occupancy.has(`${x},${y}`);
                    },
                    onEnemyAttack: (enemy) => {
                        this.handleEnemyAttack(enemy);
                    },
                    onSelfCollision: () => {
                        console.log('Self collision detected!');
                        this.gameOver();
                    },
                    onWallCollision: () => {
                        console.log('Wall collision detected!');
                        this.gameOver();
                    }
                });
            }

            this.time.delayedCall(50, () => {
                this.checkEnemyPlayerCollisions();
            });
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameraSpeed = 10;
    }

    update() {
        this.registry.set('playerLength', this.player.getLength());
        this.updateStatsFromLength();

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


    processDoubleMoveTurn(direction, helpers) {
        return new Promise((resolve) => {
            let movesLeft = 2;
            let finalResult = { completed: true };

            const processNextMove = async () => {
                if (movesLeft <= 0) {
                    resolve(finalResult);
                    return;
                }

                const moveHelpers = {
                    ...helpers,
                    skipEnemyTurn: movesLeft > 1
                };

                const result = await this.turnManager.processTurn(direction, moveHelpers);
                finalResult = result;

                if (result.died) {
                    resolve(result);
                    return;
                }

                movesLeft--;

                if (movesLeft > 0 && !result.died) {
                    this.time.delayedCall(150, processNextMove);
                } else {
                    resolve(result);
                }
            };

            processNextMove();
        });
    }


    checkEnemyPlayerCollisions() {
        const head = this.player.segments[0];
        const headGridX = Math.round(head.x);
        const headGridY = Math.round(head.y);

        this.enemies.forEach(enemy => {
            if (enemy.active &&
                enemy.gridX === headGridX &&
                enemy.gridY === headGridY &&
                !enemy.isBeingProcessed) {
                console.log(`Enemy ${enemy.subType} stepped on player head!`);
                this.handleEnemyAttack(enemy);
            }
        });
    }

    handleEnemyAttack(enemy) {
        if (!enemy.active || enemy.isBeingProcessed) return;

        enemy.isBeingProcessed = true;

        console.log(`Enemy ${enemy.subType} attacks player!`);

        const playerDamage = this.getPlayerDamage();
        let totalDamage = playerDamage;

        if (enemy.subType === 'vampire') {
            totalDamage += this.getVampireDamageBonus();
        }

        const actualDamage = Math.max(1, totalDamage - (enemy.shield || 0));
        enemy.health -= actualDamage;

        this.showFloatingText(`HP -${actualDamage}`, '#ff4444', enemy.x, enemy.y);

        if (enemy.health <= 0) {
            if (enemy.isBoss) {
                this.showFloatingText(`BOSS ${enemy.subType} DEFEATED!`, '#ff00ff', enemy.x, enemy.y);
                this.registry.set('scores', this.registry.get('scores') + 100);

                this.spawnBossReward(enemy.gridX, enemy.gridY);
            } else {
                this.showFloatingText(`${enemy.subType} slayed`, 'red');
                this.registry.set('scores', this.registry.get('scores') + 30);
            }

            if (enemy.glowEffect) {
                enemy.glowEffect.destroy();
            }

            enemy.destroy();
            this.enemies = this.enemies.filter(e => e !== enemy);
            enemy._isBeingProcessed = false;
            return;
        }

        let enemyDamage = enemy.damage;
        const playerShield = this.getPlayerShield();

        enemyDamage = Math.max(0, enemyDamage - playerShield);

        if (enemyDamage > 0) {
            this.registry.set('hp', Math.max(0, this.registry.get('hp') - enemyDamage));

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

        this.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.isBeingProcessed = false;
            }
        });
    }

    handleEnemyCollision(enemy) {
        if (!enemy.active || enemy.isBeingProcessed) return;

        console.log(`Player collides with enemy ${enemy.subType}!`);
        this.handleEnemyAttack(enemy);
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

        if (item.healthLoss) {
            const currentHP = this.registry.get('hp');
            this.registry.set('hp', Math.max(1, currentHP - item.healthLoss));
            effects.push({ text: `-${item.healthLoss} HP`, color: 'red' });

            if (this.registry.get('hp') <= 0) {
                this.gameOver();
                return;
            }
        }

        if (item.healthGain) {
            const currentHP = this.registry.get('hp');
            const maxHP = this.registry.get('maxHP');
            this.registry.set('hp', Math.min(maxHP, currentHP + item.healthGain));
            effects.push({ text: `+${item.healthGain} HP`, color: 'green' });
        }

        if (item.maxHealthIncrease) {
            const currentMaxHP = this.registry.get('baseMaxHP');
            this.registry.set('baseMaxHP', currentMaxHP + item.maxHealthIncrease);

            this.recalculateStats();

            const currentHP = this.registry.get('hp');
            const newMaxHP = this.registry.get('maxHP');
            this.registry.set('hp', Math.min(newMaxHP, currentHP + item.maxHealthIncrease));

            effects.push({ text: `Max HP +${item.maxHealthIncrease}`, color: 'yellow' });
        }

        if (item.lengthGain) {
            this.player.grow += item.lengthGain;
            this.registry.set('playerLength', this.player.getLength());
            effects.push({ text: `Length +${item.lengthGain}`, color: 'cyan' });
        }

        if (item.lengthLoss) {
            const segmentsToRemove = Math.min(item.lengthLoss, this.player.getLength() - 3);

            if (segmentsToRemove > 0) {
                if (this.player.grow >= segmentsToRemove) {
                    this.player.grow -= segmentsToRemove;
                } else {
                    const remaining = segmentsToRemove - this.player.grow;
                    this.player.grow = 0;

                    for (let i = 0; i < remaining && this.player.segments.length > 3; i++) {
                        const tail = this.player.segments.pop();
                        this.player.occupancy.delete(this.player._key(tail.x, tail.y));
                    }
                    this.player.syncSpritesToSegments();
                }

                this.registry.set('playerLength', this.player.getLength());
                effects.push({ text: `Length -${item.lengthLoss}`, color: 'orange' });
            }
        }

        if (item.tempLength && item.tempLengthDuration) {
            this.player.grow += item.tempLength;
            this.registry.set('playerLength', this.player.getLength());

            this.activeEffects.push({
                type: 'tempLength',
                value: item.tempLength,
                duration: item.tempLengthDuration,
                turnsLeft: item.tempLengthDuration,
                description: `Temp Length +${item.tempLength}`,
                itemSubType: item.subType
            });
            effects.push({ text: `Temp Length +${item.tempLength}`, color: 'lightblue' });
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
            effects.push({ text: `Regen +${item.regen}/turn`, color: 'lime' });
        }

        if (item.shield && item.shieldDuration) {
            this.activeEffects.push({
                type: 'shield',
                value: item.shield,
                duration: item.shieldDuration,
                turnsLeft: item.shieldDuration,
                description: `Shield +${item.shield}`,
                itemSubType: item.subType
            });
            effects.push({ text: `Shield +${item.shield}`, color: 'blue' });
        }

        if (item.permanentShield) {
            const currentShield = this.registry.get('permanentShield') || 0;
            this.registry.set('permanentShield', currentShield + item.permanentShield);
            effects.push({ text: `Permanent Shield +${item.permanentShield}`, color: 'darkblue' });
        }

        if (item.damageReduction) {
            const currentDmg = this.registry.get('dmg');
            this.registry.set('dmg', Math.max(1, currentDmg - item.damageReduction));
            effects.push({ text: `Damage -${item.damageReduction}`, color: 'purple' });
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
            effects.push({ text: `Damage +${item.damageBoost}`, color: 'red' });
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
            effects.push({ text: `Vampire Damage +${item.vampireDamage}`, color: 'darkred' });
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
            effects.push({ text: 'Double Move!', color: 'gold' });
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
            const effect = this.activeEffects[i];

            if (effect.type === 'tempLength') {
                effect.turnsLeft--;

                if (effect.turnsLeft <= 0) {
                    const segmentsToRemove = Math.min(effect.value, this.player.getLength() - 3);

                    if (segmentsToRemove > 0) {
                        if (this.player.grow >= segmentsToRemove) {
                            this.player.grow -= segmentsToRemove;
                        } else {
                            const remaining = segmentsToRemove - this.player.grow;
                            this.player.grow = 0;

                            for (let i = 0; i < remaining && this.player.segments.length > 3; i++) {
                                const tail = this.player.segments.pop();
                                this.player.occupancy.delete(this.player._key(tail.x, tail.y));
                            }
                            this.player.syncSpritesToSegments();
                        }

                        this.registry.set('playerLength', this.player.getLength());
                        this.showFloatingText('Temp length ended', 'white');
                    }

                    this.activeEffects.splice(i, 1);
                }
            } else {
                effect.turnsLeft--;

                if (effect.turnsLeft <= 0) {
                    const expiredEffect = effect;

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

    updateStatsFromLength() {
        const currentLength = this.registry.get('playerLength');

        if (currentLength === this.lastLength) {
            return
        }

        this.recalculateStats();
        this.lastLength = currentLength;

        const length = currentLength - 3;
        if (length % 5 === 0 && length > 0) {
            this.showFloatingText('Max HP +1', 'green');
        }
        if (length % 10 === 0 && length > 3) {
            this.showFloatingText('Damage +1!', 'red');
        }
        if (length % 20 === 0 && length > 3) {
            this.showFloatingText('Shield +1!', 'blue');
        }
    }

    recalculateStats() {
        const length = this.registry.get('playerLength') - 3;

        const baseMaxHP = this.registry.get('baseMaxHP');
        const hpBonus = Math.floor(length / 5);
        const newMaxHP = baseMaxHP + hpBonus;

        const baseDmg = this.registry.get('baseDmg');
        const dmgBonus = Math.floor(length / 10);
        const newDmg = baseDmg + dmgBonus;

        const baseShield = this.registry.get('basePermanentShield');
        const shieldBonus = Math.floor(length / 20);
        const newShield = baseShield + shieldBonus;

        this.registry.set('maxHP', newMaxHP);
        this.registry.set('dmg', newDmg);
        this.registry.set('permanentShield', newShield);

        const currentHP = this.registry.get('hp');
        if (currentHP > newMaxHP) {
            this.registry.set('hp', newMaxHP);
        }
    }


    spawnShopItems() {
        const purchasedItems = this.registry.get('playerItems') || [];

        if (purchasedItems.length === 0) return;

        const startRoom = this.mapData.rooms.find(room => room.isStart);
        if (!startRoom) {
            console.error('Start room not found');
            return;
        }

        const floorPositions = [];
        for (let x = startRoom.x + 1; x < startRoom.x + startRoom.width - 1; x++) {
            for (let y = startRoom.y + 1; y < startRoom.y + startRoom.height - 1; y++) {
                const tileKey = `${x},${y}`;
                if (this.mapTiles[tileKey] === '.' && this.isValidSpawnPosition(x, y)) {
                    floorPositions.push({ x, y });
                }
            }
        }

        const shuffledPositions = [...floorPositions].sort(() => 0.5 - Math.random());

        purchasedItems.forEach((itemKey, index) => {
            if (index < shuffledPositions.length) {
                const pos = shuffledPositions[index];
                this.createShopItem(itemKey, pos.x, pos.y);
            }
        });

        this.registry.set('playerItems', []);
        this.scene.get('UIScene').updateShopItems();
    }

    createShopItem(itemKey, gridX, gridY) {
        const worldX = gridX * TILE_SIZE;
        const worldY = gridY * TILE_SIZE;
        const itemProps = ITEM_PROPERTIES[itemKey];

        if (!itemProps) {
            console.error('Item properties not found for:', itemKey);
            return;
        }

        try {
            let frame;

            if (itemProps.type === 'potion') {
                frame = frameName(`${itemKey}_01`);
            } else {
                frame = frameName(itemKey);
            }

            const item = this.add.image(worldX + TILE_SIZE / 6, worldY + TILE_SIZE / 6, 'sprites', frame)
                .setOrigin(0)
                .setDepth(10)
                .setScale(0.7);

            Object.keys(itemProps).forEach(prop => {
                item[prop] = itemProps[prop];
            });

            item.type = itemProps.type;
            item.subType = itemKey;
            item.gridX = gridX;
            item.gridY = gridY;
            item.immediate = itemProps.immediate || false;

            this.tweens.add({
                targets: item,
                y: item.y - 3,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'ease'
            });

            if (!this.items) this.items = [];
            this.items.push(item);

            console.log(`Created shop item: ${itemKey} at (${gridX}, ${gridY})`);
        } catch (error) {
            console.error('Error creating shop item:', itemKey, error);
        }
    }

    spawnBossReward(x, y) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        const rewards = ['bigRedFlask', 'bigBlueFlask', 'cake'];
        const rewardType = Phaser.Utils.Array.GetRandom(rewards);

        const reward = this.add.image(worldX, worldY, 'sprites', frameName(rewardType))
            .setOrigin(0)
            .setDepth(25)
            .setScale(0.8);

        const rewardProps = ITEM_PROPERTIES[rewardType];
        Object.assign(reward, rewardProps);
        reward.type = rewardProps.type;
        reward.subType = rewardType;
        reward.gridX = x;
        reward.gridY = y;
        reward.immediate = false;

        this.tweens.add({
            targets: reward,
            y: reward.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'ease'
        });

        if (!this.items) this.items = [];
        this.items.push(reward);

        console.log(`Boss reward spawned: ${rewardType}`);
    }


    isWall(gridX, gridY) {
        const tileKey = `${gridX},${gridY}`;
        const tile = this.mapData.mapTiles[tileKey];
        return tile === '#';
    }

    isValidSpawnPosition(x, y) {
        const tileKey = `${x},${y}`;

        if (!this.mapTiles[tileKey]) {
            return false;
        }

        if (this.mapTiles[tileKey] !== '.') {
            return false;
        }

        const neighbors = [
            `${x - 1},${y}`, `${x + 1},${y}`,
            `${x},${y - 1}`, `${x},${y + 1}`
        ];

        const hasDoor = neighbors.some(neighbor =>
            this.mapTiles[neighbor] === 'D' || this.mapTiles[neighbor] === 'E'
        );

        return !hasDoor;
    }

    showFloatingText(text, color = 'ffffff', x = null, y = null) {
        const targetX = x !== null ? x : this.player.headSprite.x + 3;
        const targetY = y !== null ? y : this.player.headSprite.y - 10;

        const floatingText = this.add.text(targetX, targetY, text.toString(), {
            fontSize: '12px',
            fill: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(100);

        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 30;

        this.tweens.add({
            targets: floatingText,
            x: targetX + offsetX,
            y: targetY - 40 + offsetY,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }


    completeLevel() {
        console.log('Level completed! Going to shop...');

        const currentLength = this.player.getLength();
        this.registry.set('length', currentLength);

        this.registry.set('level', this.registry.get('level') + 1);

        this.showFloatingText('Level Complete!', 'gold', this.player.headSprite.x, this.player.headSprite.y - 20);

        this.time.delayedCall(500, () => {
            this.scene.start('ShopScene');
        });
    }

    gameOver() {
        if (this.registry.get('isGameOver')) return;

        this.registry.set('isGameOver', true);
        console.log('Game Over - Player died');

        this.turnManager.locked = true;

        const length = this.registry.get('playerLength');
        const level = this.registry.get('level');
        const coins = this.registry.get('coins');

        for (let i = 0; i < length - 3; i++) {
            this.registry.set('scores', this.registry.get('scores') + length * level)
        }
        const scores = this.registry.get('scores');

        const gameOverData = {
            level: level,
            scores: scores,
            coins: coins,
            playerLength: length
        };

        this.scene.stop('UIScene');
        this.scene.stop('SettingsScene');

        this.time.delayedCall(400, () => {
            this.scene.start('GameOverScene', gameOverData);
        });
    }
}