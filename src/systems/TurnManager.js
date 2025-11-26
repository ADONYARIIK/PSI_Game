export default class TurnManager {
    constructor(scene, player, enemies = []) {
        this.scene = scene;
        this.player = player;
        this.enemies = enemies;
        this.locked = false;
    }

    async processTurn(direction, helpers = {}) {
        if (this.locked) return;
        this.locked = true;

        const skipEnemyTurn = helpers.skipEnemyTurn || false;

        const result = await this.player.takeTurn(direction, helpers);

        if (result.died) {
            if (result.reason === 'self' && helpers.onSelfCollision) {
                helpers.onSelfCollision();
            } else if (result.reason === 'wall' && helpers.onWallCollision) {
                helpers.onWallCollision();
            }
        } else if (!result.skipped && !skipEnemyTurn) {
            for (const enemy of this.enemies) {
                if (enemy.active && enemy.health > 0) {
                    await this.moveEnemy(enemy, helpers);
                }
            }

            if (this.scene.processEndOfTurnEffects) {
                this.scene.processEndOfTurnEffects();
            }
        }

        this.locked = false;
        return result;
    }


    async moveEnemy(enemy, helpers = {}) {
        if (!enemy.active || enemy.health <= 0) return;

        if (enemy.isBoss) {
            await this.moveBoss(enemy, helpers);
            return;
        }

        if (enemy.moveCooldown && enemy.moveCooldown > 0) {
            enemy.moveCooldownCounter = (enemy.moveCooldownCounter || 0) + 1;
            if (enemy.moveCooldownCounter < enemy.moveCooldown) {
                return;
            }
            enemy.moveCooldownCounter = 0;
        }

        const enemyX = enemy.gridX;
        const enemyY = enemy.gridY;

        const playerHead = helpers.getPlayerHead();
        const playerX = playerHead.x;
        const playerY = playerHead.y;

        const distanceToPlayer = Math.abs(enemyX - playerX) + Math.abs(enemyY - playerY);

        if (enemy.subType === 'skull') {
            if (this.isPlayerInSameRoom(enemy, playerX, playerY)) {
                return this.moveEnemyTowardsPlayer(enemy, helpers);
            } else {
                return this.moveEnemyRandomly(enemy, helpers);
            }
        }

        if (enemy.subType === 'vampire') {
            if (distanceToPlayer <= enemy.sight) {
                return this.moveEnemyTowardsPlayer(enemy, helpers);
            }
            return;
        }

        if (distanceToPlayer <= enemy.sight) {
            return this.moveEnemyTowardsPlayer(enemy, helpers);
        } else {
            return this.moveEnemyRandomly(enemy, helpers);
        }
    }

    async moveEnemyTowardsPlayer(enemy, helpers) {
        const enemyX = enemy.gridX;
        const enemyY = enemy.gridY;

        const playerHead = helpers.getPlayerHead();
        const playerX = playerHead.x;
        const playerY = playerHead.y;

        const distanceToPlayer = Math.abs(enemyX - playerX) + Math.abs(enemyY - playerY);

        if (distanceToPlayer <= enemy.range) {
            console.log(`Enemy ${enemy.subType} is in range - attacking!`);
            if (helpers.onEnemyAttack) {
                helpers.onEnemyAttack(enemy);
            }
            return;
        }

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        const validDirections = directions.filter(({ dx, dy }) => {
            const newX = enemyX + dx;
            const newY = enemyY + dy;
            return this.isValidEnemyMove(newX, newY, enemy, helpers);
        });

        if (validDirections.length === 0) return;

        let bestDirection = null;
        let bestDistance = distanceToPlayer;

        for (const dir of validDirections) {
            const newX = enemyX + dir.dx;
            const newY = enemyY + dir.dy;
            const newDistance = Math.abs(newX - playerX) + Math.abs(newY - playerY);

            if (newDistance < bestDistance) {
                bestDistance = newDistance;
                bestDirection = dir;
            }
        }

        if (!bestDirection && validDirections.length > 0) {
            bestDirection = Phaser.Utils.Array.GetRandom(validDirections);
        }

        if (bestDirection) {
            const moveDistance = this.getEnemyMoveDistance(enemy, distanceToPlayer);

            for (let i = 0; i < moveDistance; i++) {
                if (!this.isValidEnemyMove(enemy.gridX + bestDirection.dx, enemy.gridY + bestDirection.dy, enemy, helpers)) {
                    break;
                }

                await this.executeEnemyMove(enemy, bestDirection, helpers);

                const newPlayerHead = helpers.getPlayerHead();
                if (enemy.gridX === newPlayerHead.x && enemy.gridY === newPlayerHead.y) {
                    console.log(`Enemy ${enemy.subType} moved onto player - attacking!`);
                    if (helpers.onEnemyAttack) {
                        helpers.onEnemyAttack(enemy);
                    }
                    break;
                }
            }
        }
    }

    async moveEnemyRandomly(enemy, helpers) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        const validDirections = directions.filter(({ dx, dy }) => {
            const newX = enemy.gridX + dx;
            const newY = enemy.gridY + dy;

            if (enemy.moveRadius > 0) {
                const spawnX = enemy.originalX || enemy.gridX;
                const spawnY = enemy.originalY || enemy.gridY;
                const distanceFromSpawn = Math.abs(newX - spawnX) + Math.abs(newY - spawnY);
                if (distanceFromSpawn > enemy.moveRadius) {
                    return false;
                }
            }

            return this.isValidEnemyMove(newX, newY, enemy, helpers);
        });

        if (validDirections.length === 0) return;

        const direction = Phaser.Math.RND.pick(validDirections);
        const moveDistance = this.getEnemyMoveDistance(enemy, Infinity);

        for (let i = 0; i < moveDistance; i++) {
            if (!this.isValidEnemyMove(enemy.gridX + direction.dx, enemy.gridY + direction.dy, enemy, helpers)) {
                break;
            }

            await this.executeEnemyMove(enemy, direction, helpers);
        }
    }


    async moveBoss(boss, helpers = {}) {
        const bossX = boss.gridX;
        const bossY = boss.gridY;

        const playerHead = helpers.getPlayerHead();
        const playerX = playerHead.x;
        const playerY = playerHead.y;

        const distanceToPlayer = Math.abs(bossX - playerX) + Math.abs(bossY - playerY);

        if (distanceToPlayer <= boss.sight) {
            await this.moveEnemyTowardsPlayer(boss, helpers);
        } else {
            await this.patrolBossRoom(boss, helpers);
        }
    }

    async patrolBossRoom(boss, helpers) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        const validDirections = directions.filter(({ dx, dy }) => {
            const newX = boss.gridX + dx;
            const newY = boss.gridY + dy;
            return this.isValidEnemyMove(newX, newY, boss, helpers);
        });

        if (validDirections.length === 0) return;

        const direction = Phaser.Math.RND.pick(validDirections);
        await this.executeEnemyMove(boss, direction, helpers);
    }


    isPlayerInSameRoom(enemy, playerX, playerY) {
        const roomSize = 10;
        return Math.abs(enemy.gridX - playerX) <= roomSize &&
            Math.abs(enemy.gridY - playerY) <= roomSize;
    }

    getEnemyMoveDistance(enemy, distanceToPlayer) {
        if (enemy.subType === 'vampire' && distanceToPlayer <= 6) {
            return 2;
        }

        if (enemy.subType === 'priestHand' && distanceToPlayer > enemy.sight) {
            return 2;
        }

        return 1;
    }

    isValidEnemyMove(x, y, enemy, helpers) {
        if (helpers.isWallAt && helpers.isWallAt(x, y)) return false;

        if (helpers.getEnemyAt) {
            const otherEnemy = helpers.getEnemyAt(x, y, enemy);
            if (otherEnemy) return false;
        }

        return true;
    }

    async executeEnemyMove(enemy, direction, helpers) {
        const newGridX = enemy.gridX + direction.dx;
        const newGridY = enemy.gridY + direction.dy;

        enemy.gridX = newGridX;
        enemy.gridY = newGridY;

        this.scene.tweens.add({
            targets: enemy,
            x: newGridX * 16,
            y: newGridY * 16,
            duration: 200,
            ease: 'Power1'
        });

        await this.scene.time.delayedCall(200);
    }
}