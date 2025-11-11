import Phaser from 'phaser';
import TurnManager from '../systems/TurnManager.js';
import { Directions, TILE_SIZE } from '../entities/consts.js';
import { generateMap } from '../generation/MapGenerator.js';
import { createSnake } from '../utils/createHelper.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.items = [];
        this.enemies = [];
    }

    create() {
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setScrollFactor(0);
        overlay.setDepth(9999);

        this.registry.set('hp', 10);
        this.registry.set('dmg', 2);
        this.registry.set('coins', 0);
        this.registry.set('scores', 0);
        this.registry.set('level', 0);
        this.registry.set('playerLength', 3);
        this.registry.set('silverKeys', 0);
        this.registry.set('goldKeys', 0);

        this.mapData = generateMap(this, Phaser.Math.Between(5, 15));
        // this.mapData = generateMap(this, 50);

        this.mapTiles = this.mapData.mapTiles;
        this.offset = this.mapData.offset;

        if (!this.mapData.start) {
            console.error('No start room found in map data');
            return;
        }

        this.player = createSnake(this, this.mapData.start, this.mapData.offset, 'Right');

        if (!this.player) {
            console.error('Failed to create snake');
            return;
        }

        // this.createCoordinateDebug();

        this.cameras.main.setBounds(
            this.mapData.bounds.left,
            this.mapData.bounds.top,
            this.mapData.bounds.width,
            this.mapData.bounds.height
        );

        // this.cameras.main.startFollow(this.player.headSprite);
        // this.cameras.main.setZoom(2.5);

        // this.cameras.main.zoom = 1;
        this.cameras.main.zoom = 1.5;
        // this.cameras.main.setScroll(0, 0);

        // console.log('Camera bounds:', this.cameras.main.getBounds());
        // console.log('Snake position:', this.player.headSprite.x, this.player.headSprite.y);
        // console.log('Start room:', mapData.start);

        if (!this.items) this.items = [];
        if (!this.enemies) this.enemies = [];

        this.turnManager = new TurnManager(this, this.player, this.enemies);

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
                    // Преобразуем мировые координаты в координаты карты
                    const gridX = worldX - this.mapData.offset.offsetX;
                    const gridY = worldY - this.mapData.offset.offsetY;
                    const tileKey = `${gridX},${gridY}`;
                    const isWall = this.mapData.mapTiles[tileKey] === '#';
                    return isWall;
                },
                getEntityAt: (worldX, worldY) => {
                    // Преобразуем мировые координаты в координаты карты
                    const gridX = worldX - this.mapData.offset.offsetX;
                    const gridY = worldY - this.mapData.offset.offsetY;

                    // Проверяем предметы
                    const item = this.items.find(it => {
                        const itemGridX = it.gridX;
                        const itemGridY = it.gridY;
                        const match = itemGridX === gridX && itemGridY === gridY;
                        if (match) console.log(`Found item: ${it.type} at grid(${itemGridX},${itemGridY})`);
                        return match;
                    });
                    if (item) return item;

                    // Проверяем врагов
                    const enemy = this.enemies.find(e => {
                        const enemyGridX = e.gridX;
                        const enemyGridY = e.gridY;
                        const match = enemyGridX === gridX && enemyGridY === gridY;
                        if (match) console.log(`Found enemy: ${e.subType} at grid(${enemyGridX},${enemyGridY})`);
                        return match;
                    });
                    if (enemy) return enemy;

                    return null;
                },
                onEat: (item) => {
                    console.log(`Eating item: ${item.type}`);
                    this.handleItemCollection(item);
                },
                onCollide: (entity) => {
                    console.log(`Collision with: ${entity.type} ${entity.subType}`);
                    this.handleEnemyCollision(entity);
                },
                tileSize: TILE_SIZE,
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

    createCoordinateDebug() {
        const debugText = this.add.text(10, 200, '', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000'
        });
        debugText.setScrollFactor(0);
        debugText.setDepth(1000);

        this.events.on('update', () => {
            if (this.player) {
                const head = this.player.segments[0];
                const gridX = head.x - this.offset.offsetX;
                const gridY = head.y - this.offset.offsetY;

                debugText.setText([
                    `World: ${head.x}, ${head.y}`,
                    `Grid: ${gridX}, ${gridY}`,
                    `Offset: ${this.offset.offsetX}, ${this.offset.offsetY}`,
                    `Tile: ${this.mapTiles[`${gridX},${gridY}`] || 'empty'}`,
                    `Items: ${this.items.length}, Enemies: ${this.enemies.length}`
                ]);
            }
        });
    }

    handleItemCollection(item) {
        if (item.type === 'food') {
            this.player.grow += 1;
            this.registry.set('scores', this.registry.get('scores') + 10);
            this.registry.set('playerLength', this.player.getLength());

            // Восстанавливаем немного здоровья от еды
            const currentHP = this.registry.get('hp');
            const maxHP = 10;
            if (currentHP < maxHP) {
                this.registry.set('hp', currentHP + 1);
            }

        } else if (item.type === 'coin') {
            this.registry.set('coins', this.registry.get('coins') + 1);
            this.registry.set('scores', this.registry.get('scores') + 5);

        } else if (item.type === 'potion') {
            const currentHP = this.registry.get('hp');
            const maxHP = 10;

            if (item.subType === 'smallRedFlask') {
                this.registry.set('hp', Math.min(maxHP, currentHP + 2));
                this.registry.set('scores', this.registry.get('scores') + 10);
            } else if (item.subType === 'bigRedFlask') {
                this.registry.set('hp', maxHP);
                this.registry.set('scores', this.registry.get('scores') + 25);
            } else if (item.subType === 'smallBlueFlask') {
                const currentDmg = this.registry.get('dmg');
                this.registry.set('dmg', currentDmg + 1);
                this.registry.set('scores', this.registry.get('scores') + 15);

                this.time.delayedCall(10000, () => {
                    this.registry.set('dmg', Math.max(2, currentDmg));
                });
            } else if (item.subType === 'bigBlueFlask') {
                const currentDmg = this.registry.get('dmg');
                this.registry.set('dmg', currentDmg + 2);
                this.registry.set('scores', this.registry.get('scores') + 35);

                this.time.delayedCall(15000, () => {
                    this.registry.set('dmg', Math.max(2, currentDmg));
                });
            }

        } else if (item.type === 'key') {
            if (item.subType === 'silverKey') {
                this.registry.set('silverKeys', (this.registry.get('silverKeys') || 0) + 1);
            } else if (item.subType === 'goldKey') {
                this.registry.set('goldKeys', (this.registry.get('goldKeys') || 0) + 1);
            }
            this.registry.set('scores', this.registry.get('scores') + 20);
        }

        this.showCollectionEffect(item.x, item.y, item.type);

        item.destroy();
        this.items = this.items.filter(i => i !== item);
    }

    handleEnemyCollision(enemy) {
        // Наносим урон врагу
        const playerDamage = this.registry.get('dmg');
        enemy.health -= playerDamage;

        // Обновляем индикатор здоровья
        if (enemy.getData('updateHealthBar')) {
            enemy.getData('updateHealthBar')();
        }

        if (enemy.health <= 0) {
            // Враг умирает
            this.showDeathEffect(enemy.x, enemy.y);
            enemy.destroy();
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.registry.set('scores', this.registry.get('scores') + 30);
        } else {
            // Враг наносит урон игроку
            this.registry.set('hp', this.registry.get('hp') - enemy.damage);

            // Эффект получения урона
            this.cameras.main.shake(100, 0.01);

            // Проверяем смерть игрока
            if (this.registry.get('hp') <= 0) {
                this.gameOver();
            }
        }
    }

    showCollectionEffect(x, y, type) {
        const text = this.add.text(x, y - 10, '+', {
            fontSize: '16px',
            fill: '#ffff00'
        }).setDepth(20);

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    showDeathEffect(x, y) {
        const particles = this.add.particles('sprites');

        const emitter = particles.createEmitter({
            frame: 'skull_01.png',
            x: x + 8,
            y: y + 8,
            speed: { min: 20, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            quantity: 5
        });

        this.time.delayedCall(800, () => {
            particles.destroy();
        });
    }
}