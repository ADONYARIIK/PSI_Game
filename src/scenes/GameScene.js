import Phaser from 'phaser';
import { loadTiledObjects } from '../utils/tiledLoader.js';
import TurnManager from '../systems/TurnManager.js';
import { Directions, TILE_SIZE } from '../entities/consts.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.scene.launch('SettingsScene');
        this.scene.bringToTop('SettingsScene');
        
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        this.registry.set('hp', 10);
        this.registry.set('dmg', 2);
        this.registry.set('coins', 0);
        this.registry.set('scores', 0);
        this.registry.set('level', 0);
        this.registry.set('playerLength', 3);

        const guideLevel = this.make.tilemap({ key: 'guide' });
        const tiles = guideLevel.addTilesetImage('tiles', 'tiles');

        const backgroundLayer = guideLevel.createLayer('Background', tiles, 0, 0);
        const floorLayer = guideLevel.createLayer('Floor', tiles, 0, 0);
        const wallsLayer = guideLevel.createLayer('Walls', tiles, 0, 0);

        this.cameras.main.setBounds(0, 0, guideLevel.widthInPixels, guideLevel.heightInPixels);
        this.cameras.main.zoom = 2.5;
        this.cameras.main.setScroll(-350, -170);

        const objects = loadTiledObjects(this, guideLevel);

        this.player = objects.snake;
        this.enemies = objects.enemies || [];
        console.log(this.decor);

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
                isWallAt: (x, y) => {
                    const tile = wallsLayer.getTileAt(x, y);
                    return !!tile && !!tile.properties && !!tile.properties.collides;
                },
                getEntityAt: (x, y) => {
                    return this.enemies.find(e => (e.gridX !== undefined ? e.gridX : Math.floor(e.x / TILE_SIZE)) === x && (e.gridY !== undefined ? e.gridY : Math.floor(e.y / TILE_SIZE)) === y) || this.items?.find(it => it.x === x && it.y === y) || null;
                },
                onEat: (item) => {/*delete item, +hp, +length*/ },
                onCollide: (entity) => {/*fight */ },
                tileSize: TILE_SIZE,
                getPlayerHead: () => ({ x: this.player.segments[0].x, y: this.player.segments[0].y })
            });
        });
    }

    update() {

    }
}