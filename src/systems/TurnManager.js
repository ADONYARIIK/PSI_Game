import { TILE_SIZE } from "../entities/consts";

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

        const result = await this.player.takeTurn(direction, helpers);

        if (result.died) {
            if (result.reason === 'self' && helpers.onSelfCollision) {
                helpers.onSelfCollision();
            } else if (result.reason === 'wall' && helpers.onWallCollision) {
                helpers.onWallCollision();
            }
        } else if (!result.skipped) {
            for (const enemy of this.enemies) {
                await this.moveEnemy(enemy, helpers);
            }

            if (this.scene.processEndOfTurnEffects) {
                this.scene.processEndOfTurnEffects();
            }
        }

        this.locked = false;
        return result;
    }

    async moveEnemy(enemy, helpers = {}) {
        const enemyX = enemy.gridX;
        const enemyY = enemy.gridY;

        const playerHead = helpers.getPlayerHead();
        const playerX = playerHead.x;
        const playerY = playerHead.y;

        const distanceToPlayer = Math.abs(enemyX - playerX) + Math.abs(enemyY - playerY);

        if (distanceToPlayer > enemy.sight) {
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

            if (this.scene.isWall(newX, newY)) return false;

            const hasEnemy = helpers.getEnemyAt ? helpers.getEnemyAt(newX, newY, enemy) : false;
            if (hasEnemy) return false;

            const hasSnake = helpers.isSnakeAt ? helpers.isSnakeAt(newX, newY) : false;
            if (hasSnake) return false;

            return true;
        });

        if (validDirections.length === 0) return;

        const isAdjacentToPlayer = distanceToPlayer === 1;

        if (isAdjacentToPlayer) {
            console.log(`Enemy ${enemy.subType} is adjacent to player and can attack`);
        }

        let bestDirection = validDirections[0];
        let bestDistance = distanceToPlayer;

        for (const dir of validDirections) {
            const newX = enemyX + dir.dx;
            const newY = enemyY + dir.dy;
            const distance = Math.abs(newX - playerX) + Math.abs(newY - playerY);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        }

        if (Math.random() < 0.2 && validDirections.length > 1) {
            bestDirection = Phaser.Utils.Array.GetRandom(validDirections);
        }

        if (bestDistance <= distanceToPlayer || Math.random() < 0.7) {
            const newGridX = enemyX + bestDirection.dx;
            const newGridY = enemyY + bestDirection.dy;

            enemy.gridX = newGridX;
            enemy.gridY = newGridY;
            enemy.x = newGridX * 16;
            enemy.y = newGridY * 16;

            await new Promise(res => setTimeout(res, 150));
        }
    }

    isPlayerFacingEnemy(playerHead, enemy, helpers) {
        const player = helpers.getPlayer();
        if (!player || !player.direction) return false;

        const dx = enemy.gridX - playerHead.x;
        const dy = enemy.gridY - playerHead.y;

        switch (player.direction.name) {
            case 'Right':
                return dx > 0 && Math.abs(dy) <= Math.abs(dx);
            case 'Left':
                return dx < 0 && Math.abs(dy) <= Math.abs(dx);
            case 'Down':
                return dy > 0 && Math.abs(dx) <= Math.abs(dy);
            case 'Up':
                return dy < 0 && Math.abs(dx) <= Math.abs(dy);
            default:
                return false;
        }
    }
}