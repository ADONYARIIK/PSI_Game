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

            if (room.type === 'boss') {
                this.spawnBossInRoom(room);
            } else {
                this.spawnEntitiesInRoom(room);
            }
        }

        this.spawnExits();
    }


    spawnBossInRoom(room) {
        if (room.type !== 'boss') return;

        const floorPositions = this.getFloorPositions(room);
        if (floorPositions.length === 0) return;

        const centerX = room.x + Math.floor(room.width / 2);
        const centerY = room.y + Math.floor(room.height / 2);

        let bossPosition = this.findValidBossPosition(centerX, centerY, room, floorPositions);

        if (bossPosition) {
            this.spawnBoss(bossPosition.x, bossPosition.y);
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

        if (room.type !== 'treasure' && room.type !== 'boss' && Math.random() < this.spawnRates.enemy) {
            this.spawnEnemy(room, floorPositions);
        }
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

    spawnEnemy(room, positions) {
        const count = this.getSpawnCountForRoom(room, 'enemy');
        this.spawnRandomEntities(positions, count, 'enemy');
    }

    spawnExits() {
        for (const room of this.rooms) {
            if (room.hasExit) {
                const exitX = room.x + Math.floor(room.width / 2);
                const exitY = room.y + Math.floor(room.height / 2);
                this.createExit(exitX, exitY);
            }
        }
    }


    createFood(x, y) {
        const foodTypeObj = Phaser.Math.RND.weightedPick(this.foodWeights);
        const foodType = foodTypeObj.key;
        const foodProps = ITEM_PROPERTIES[foodType];

        try {
            const food = this.scene.add.sprite(x, y, 'sprites', frameName(`${foodType}`))
                .setOrigin(-0.3)
                .setDepth(25)
                .setScale(0.7);

            Object.assign(food, foodProps);
            food.type = 'food';
            food.subType = foodType;
            food.gridX = Math.floor(x / TILE_SIZE);
            food.gridY = Math.floor(y / TILE_SIZE);

            this.scene.tweens.add({
                targets: food,
                y: food.y - 3,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'ease'
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
                .setDepth(25);

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
                .setDepth(25);

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
                .setDepth(30);

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
            enemy.originalX = Math.floor(x / TILE_SIZE);
            enemy.originalY = Math.floor(y / TILE_SIZE);
            enemy.gridX = Math.floor(x / TILE_SIZE);
            enemy.gridY = Math.floor(y / TILE_SIZE);
            enemy.health = enemyData.health;
            enemy.maxHealth = enemyData.health;
            enemy.damage = enemyData.damage;
            enemy.shield = enemyData.shield;
            enemy.range = enemyData.range;
            enemy.sight = enemyData.sight;
            enemy.moveRadius = enemyData.moveRadius;

            if (enemyData.lifesteal !== undefined) enemy.lifesteal = enemyData.lifesteal;
            if (enemyData.moveCooldown !== undefined) enemy.moveCooldown = enemyData.moveCooldown;

            enemy.moveCooldownCounter = 0;

            if (!this.scene.enemies) this.scene.enemies = [];
            this.scene.enemies.push(enemy);
            return true;
        } catch (error) {
            console.error('Error creating enemy:', enemyData.key, error);
            return false;
        }
    }

    createExit(x, y) {
        const wx = x * TILE_SIZE;
        const wy = y * TILE_SIZE;

        try {
            const exit = this.scene.add.sprite(wx, wy, 'sprites', frameName(`${TEXTURES.exitClose[0]}`))
                .setOrigin(0)
                .setDepth(5);

            exit.type = 'exit';
            exit.subType = 'levelExit';
            exit.gridX = x;
            exit.gridY = y;
            exit.isInteractive = true;

            if (!this.scene.exits) this.scene.exits = [];
            this.scene.exits.push(exit);
        } catch (error) {
            console.error('Error creating exit:', error);
            return false;
        }
    }

    createBoss(x, y) {
        const bossData = Phaser.Math.RND.weightedPick(this.enemyWeights);
        const bossFrames = TEXTURES.enemy[bossData.key];

        if (!bossFrames) {
            console.error('Boss frames not found for type:', bossData.key);
            return false;
        }

        try {
            const firstFrame = bossFrames[0];
            const boss = this.scene.add.sprite(x, y, 'sprites', frameName(`${firstFrame}`))
                .setOrigin(0)
                .setDepth(35)
                .setScale(1.2);

            const animKey = `${bossData.key}_anim`;
            if (!this.scene.anims.exists(animKey)) {
                const frames = bossFrames.map(frame => ({
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

            boss.play(animKey);
            boss.type = 'enemy';
            boss.subType = bossData.key;
            boss.gridX = Math.floor(x / TILE_SIZE);
            boss.gridY = Math.floor(y / TILE_SIZE);

            boss.health = bossData.health * 2;
            boss.maxHealth = bossData.health * 2;
            boss.damage = bossData.damage * 2;

            if (bossData.key === 'skull') {
                boss.shield = bossData.shield + 1;
            } else if (bossData.key === 'vampire') {
                boss.shield = Math.floor(bossData.shield * 1.5);
            } else {
                boss.shield = bossData.shield;
            }

            boss.range = bossData.range * 2;
            boss.sight = bossData.sight * 2;
            boss.moveRadius = bossData.moveRadius * 2;

            if (bossData.lifesteal !== undefined) boss.lifesteal = bossData.lifesteal;
            if (bossData.moveCooldown !== undefined) boss.moveCooldown = bossData.moveCooldown;

            boss.moveCooldownCounter = 0;
            boss.isBoss = true;

            this.addBossEffects(boss);

            if (!this.scene.enemies) this.scene.enemies = [];
            this.scene.enemies.push(boss);
            return true;
        } catch (error) {
            console.error('Error creating boss:', bossData.key, error);
            return false;
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
        const tileKey = `${x},${y}`;
        const tile = this.mapTiles[tileKey];

        if (tile === '#' || tile === 'D' || tile === 'E') {
            return false;
        }

        const neighbors = [
            `${x - 1},${y}`, `${x + 1},${y}`,
            `${x},${y - 1}`, `${x},${y + 1}`,
            `${x - 1},${y - 1}`, `${x + 1},${y - 1}`,
            `${x - 1},${y + 1}`, `${x + 1},${y + 1}`
        ];

        const nearDoor = neighbors.some(neighbor =>
            this.mapTiles[neighbor] === 'D' || this.mapTiles[neighbor] === 'E'
        );

        if (nearDoor) return false;

        return true;
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
            console.log(`Position ${key} already occupied, skipping ${type}`);
            return;
        }

        if (!this.isValidSpawnPosition(x, y)) {
            console.log(`Invalid spawn position ${key} for ${type}`);
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
            case 'enemy':
                entityCreated = this.createEnemy(worldX, worldY);
                break;
        }

        if (entityCreated) {
            this.occupiedPositions.add(key);
        }
    }


    findValidBossPosition(centerX, centerY, room, floorPositions) {
        if (this.isValidSpawnPosition(centerX, centerY) &&
            !this.occupiedPositions.has(`${centerX},${centerY}`)) {
            return { x: centerX, y: centerY };
        }

        const searchRadius = 3;
        for (let radius = 1; radius <= searchRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const x = centerX + dx;
                        const y = centerY + dy;

                        if (x >= room.x + 1 && x < room.x + room.width - 1 &&
                            y >= room.y + 1 && y < room.y + room.height - 1 &&
                            this.isValidSpawnPosition(x, y) &&
                            !this.occupiedPositions.has(`${x},${y}`)) {
                            return { x, y };
                        }
                    }
                }
            }
        }

        return floorPositions.length > 0 ? floorPositions[0] : null;
    }

    spawnBoss(x, y) {
        const key = `${x},${y}`;

        if (this.occupiedPositions.has(key)) {
            console.log(`Position ${key} already occupied, skipping boss`);
            return;
        }

        if (!this.isValidSpawnPosition(x, y)) {
            console.log(`Invalid spawn position ${key} for boss`);
            return;
        }

        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        const bossCreated = this.createBoss(worldX, worldY);

        if (bossCreated) {
            this.occupiedPositions.add(key);
            console.log(`Boss spawned at (${x}, ${y})`);
        }
    }

    addBossEffects(boss) {
        const glow = this.scene.add.circle(boss.x + 8, boss.y + 8, 12, 0xff0000, 0.3)
            .setDepth(34);

        this.scene.tweens.add({
            targets: glow,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        boss.glowEffect = glow;
    }
}