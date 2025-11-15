import { TEXTURES, SPAWN_WEIGHTS, ENEMY_STATS, SPAWN_COUNTS, ITEM_PROPERTIES, TILE_SIZE, frameName } from '../entities/consts.js';

export class EntitySpawner {
    constructor(scene, mapTiles, roomTiles, rooms) {
        this.scene = scene;
        this.mapTiles = mapTiles;
        this.roomTiles = roomTiles;
        this.rooms = rooms;

        this.spawnRates = SPAWN_WEIGHTS.rates;
        this.foodWeights = SPAWN_WEIGHTS.food;
        this.potionWeights = SPAWN_WEIGHTS.potion;
        this.keyWeights = SPAWN_WEIGHTS.key;
        this.spawnCounts = SPAWN_COUNTS;

        this.enemyWeights = Object.keys(ENEMY_STATS).map(enemyKey => ({
            key: enemyKey,
            weight: ENEMY_STATS[enemyKey].weight,
            health: ENEMY_STATS[enemyKey].health,
            damage: ENEMY_STATS[enemyKey].damage,
            shield: ENEMY_STATS[enemyKey].shield,
            range: ENEMY_STATS[enemyKey].range,
            sight: ENEMY_STATS[enemyKey].sight,
            moveRadius: ENEMY_STATS[enemyKey].moveRadius
        }));

        this.occupiedPositions = new Set();
    }

    spawnAllEntities() {
        for (const room of this.rooms) {
            if (room.type === 'start' || room.isCorridor) continue;

            this.spawnEntitiesInRoom(room);
        }
    }

    spawnEntitiesInRoom(room) {
        const floorPositions = this.getFloorPositions(room);
        if (floorPositions.length === 0) return;

        if (Math.random() < this.spawnRates.food) {
            this.spawnFood(room, floorPositions);
        }

        if (Math.random() < this.spawnRates.coin) {
            this.spawnCoins(room, floorPositions);
        }

        if (Math.random() < this.spawnRates.potion) {
            this.spawnPotion(room, floorPositions);
        }

        if (Math.random() < this.spawnRates.key) {
            this.spawnKey(room, floorPositions);
        }

        if (room.type !== 'treasure' && Math.random() < this.spawnRates.enemy) {
            this.spawnEnemy(room, floorPositions);
        }
    }

    getFloorPositions(room) {
        const positions = [];

        for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
            for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
                const tileKey = `${x},${y}`;
                if (this.mapTiles[tileKey] === '.' && this.isValidSpawnPosition(x, y)) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    }

    isValidSpawnPosition(x, y) {
        const neighbors = [
            `${x - 1},${y}`, `${x + 1},${y}`,
            `${x},${y - 1}`, `${x},${y + 1}`
        ];

        return !neighbors.some(neighbor => this.mapTiles[neighbor] === 'D');
    }

    spawnFood(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'food');
        this.spawnRandomEntities(positions, count, 'food');
    }

    spawnCoins(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'coin');
        this.spawnRandomEntities(positions, count, 'coin');
    }

    spawnPotion(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'potion');
        this.spawnRandomEntities(positions, count, 'potion');
    }

    spawnKey(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'key');
        this.spawnRandomEntities(positions, count, 'key');
    }

    spawnEnemy(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'enemy');
        this.spawnRandomEntities(positions, count, 'enemy');
    }

    getSpawnCountForRoom(room, type) {
        const config = this.spawnCounts[type];
        let baseCount = Phaser.Math.Between(config.min, config.max);

        const roomSize = room.width * room.height;
        if (roomSize > 100) baseCount += config.largeBonus;

        return baseCount;
    }

    spawnRandomEntities(positions, count, type) {
        const shuffled = [...positions].sort(() => 0.5 - Math.random());
        const spawnPositions = shuffled.slice(0, count);

        for (const pos of spawnPositions) {
            this.spawnEntity(pos.x, pos.y, type);
        }
    }

    spawnEntity(x, y, type) {
        const key = `${x},${y}`;

        if (this.occupiedPositions.has(key)) {
            return;
        }

        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        let entityCreated = false;

        switch (type) {
            case 'food':
                entityCreated = this.createFood(worldX, worldY);
                break;
            case 'coin':
                entityCreated = this.createCoin(worldX, worldY);
                break;
            case 'potion':
                entityCreated = this.createPotion(worldX, worldY);
                break;
            case 'key':
                entityCreated = this.createKey(worldX, worldY);
                break;
            case 'enemy':
                entityCreated = this.createEnemy(worldX, worldY);
                break;
        }

        if (entityCreated) {
            this.occupiedPositions.add(key);
        }
    }

    createFood(x, y) {
        const foodTypeObj = Phaser.Math.RND.weightedPick(this.foodWeights);
        const foodType = foodTypeObj.key;
        const foodProps = ITEM_PROPERTIES[foodType];

        try {
            const food = this.scene.add.sprite(x, y, 'sprites', frameName(`${foodType}`))
                .setOrigin(0)
                .setDepth(10)
                .setScale(0.7);

            Object.assign(food, foodProps);
            food.type = 'food';
            food.subType = foodType;
            food.gridX = Math.floor(x / TILE_SIZE);
            food.gridY = Math.floor(y / TILE_SIZE);

            this.scene.tweens.add({
                targets: food,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            if (!this.scene.items) this.scene.items = [];
            this.scene.items.push(food);
            return true;
        } catch (error) {
            console.error('Error creating food:', foodType, error);
            return false;
        }
    }

    createCoin(x, y) {
        const coinFrame = Phaser.Utils.Array.GetRandom(TEXTURES.coin);

        try {
            const coin = this.scene.add.sprite(x, y, 'sprites', frameName(`${coinFrame}`))
                .setOrigin(0)
                .setDepth(10);

            if (!this.scene.anims.exists('coin_anim')) {
                const frames = TEXTURES.coin.map(frame => ({
                    key: 'sprites',
                    frame: frameName(`${frame}`)
                }));

                this.scene.anims.create({
                    key: 'coin_anim',
                    frames: frames,
                    frameRate: 8,
                    repeat: -1
                });
            }

            coin.play('coin_anim');
            coin.type = 'coin';
            coin.value = Phaser.Math.Between(1, 3);
            coin.gridX = Math.floor(x / TILE_SIZE);
            coin.gridY = Math.floor(y / TILE_SIZE);

            if (!this.scene.items) this.scene.items = [];
            this.scene.items.push(coin);
            return true;
        } catch (error) {
            console.error('Error creating coin:', coinFrame, error);
            return false;
        }
    }

    createPotion(x, y) {
        const potionTypeObj = Phaser.Math.RND.weightedPick(this.potionWeights);
        const potionType = potionTypeObj.key;
        const potionFrames = TEXTURES[potionType];
        const potionProps = ITEM_PROPERTIES[potionType];

        if (!potionFrames) {
            console.error('Potion frames not found for type:', potionType);
            return;
        }

        try {
            const firstFrame = potionFrames[0];
            const potion = this.scene.add.sprite(x, y, 'sprites', frameName(`${firstFrame}`))
                .setOrigin(0)
                .setDepth(10);

            const animKey = `${potionType}_anim`;
            if (!this.scene.anims.exists(animKey)) {
                const frames = potionFrames.map(frame => ({
                    key: 'sprites',
                    frame: frameName(`${frame}`)
                }));

                this.scene.anims.create({
                    key: animKey,
                    frames: frames,
                    frameRate: 5,
                    repeat: -1
                });
            }

            Object.assign(potion, potionProps);
            potion.play(animKey);
            potion.type = 'potion';
            potion.subType = potionType;
            potion.gridX = Math.floor(x / TILE_SIZE);
            potion.gridY = Math.floor(y / TILE_SIZE);

            if (!this.scene.items) this.scene.items = [];
            this.scene.items.push(potion);
            return true;
        } catch (error) {
            console.error('Error creating potion:', potionType, error);
            return false;
        }
    }

    createKey(x, y) {
        const keyTypeObj = Phaser.Math.RND.weightedPick(this.keyWeights);
        const keyType = keyTypeObj.key;
        const keyFrames = TEXTURES[keyType];
        const keyProps = ITEM_PROPERTIES[keyType];

        if (!keyFrames) {
            console.error('Key frames not found for type:', keyType);
            return;
        }

        try {
            const firstFrame = keyFrames[0];
            const key = this.scene.add.sprite(x, y, 'sprites', frameName(`${firstFrame}`))
                .setOrigin(0)
                .setDepth(10);

            const animKey = `${keyType}_anim`;
            if (!this.scene.anims.exists(animKey)) {
                const frames = keyFrames.map(frame => ({
                    key: 'sprites',
                    frame: frameName(`${frame}`)
                }));

                this.scene.anims.create({
                    key: animKey,
                    frames: frames,
                    frameRate: 6,
                    repeat: -1
                });
            }

            Object.assign(key, keyProps);
            key.play(animKey);
            key.type = 'key';
            key.subType = keyType;
            key.gridX = Math.floor(x / TILE_SIZE);
            key.gridY = Math.floor(y / TILE_SIZE);

            if (!this.scene.items) this.scene.items = [];
            this.scene.items.push(key);
            return true;
        } catch (error) {
            console.error('Error creating key:', keyType, error);
            return false;
        }
    }

    createEnemy(x, y) {
        const enemyData = Phaser.Math.RND.weightedPick(this.enemyWeights);
        const enemyFrames = TEXTURES.enemy[enemyData.key];

        if (!enemyFrames) {
            console.error('Enemy frames not found for type:', enemyData.key);
            return;
        }

        try {
            const firstFrame = enemyFrames[0];
            const enemy = this.scene.add.sprite(x, y, 'sprites', frameName(`${firstFrame}`))
                .setOrigin(0)
                .setDepth(15);

            const animKey = `${enemyData.key}_anim`;
            if (!this.scene.anims.exists(animKey)) {
                const frames = enemyFrames.map(frame => ({
                    key: 'sprites',
                    frame: frameName(`${frame}`)
                }));

                this.scene.anims.create({
                    key: animKey,
                    frames: frames,
                    frameRate: 6,
                    repeat: -1
                });
            }

            enemy.play(animKey);
            enemy.type = 'enemy';
            enemy.subType = enemyData.key;
            enemy.gridX = Math.floor(x / TILE_SIZE);
            enemy.gridY = Math.floor(y / TILE_SIZE);
            enemy.health = enemyData.health;
            enemy.maxHealth = enemyData.health;
            enemy.damage = enemyData.damage;
            enemy.shield = enemyData.shield;
            enemy.range = enemyData.range;
            enemy.sight = enemyData.sight;
            enemy.moveRadius = enemyData.moveRadius;

            if (enemyData.lifesteal) enemy.lifesteal = true;
            if (enemyData.moveCooldown) enemy.moveCooldown = enemyData.moveCooldown;

            if (!this.scene.enemies) this.scene.enemies = [];
            this.scene.enemies.push(enemy);
            return true;
        } catch (error) {
            console.error('Error creating enemy:', enemyData.key, error);
            return false;
        }
    }
}