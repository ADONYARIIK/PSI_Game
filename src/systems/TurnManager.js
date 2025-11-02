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

        await this.player.takeTurn(direction, helpers);

        for (const enemy of this.enemies) {
            await this.moveEnemy(enemy, helpers);
        }

        this.locked = false;
    }

    async moveEnemy(enemy, helpers = {}) {
        const tileSize = TILE_SIZE;
        const enemyX = (enemy.gridX !== undefined) ? enemy.gridX : Math.floor(enemy.x / tileSize);
        const enemyY = (enemy.gridY !== undefined) ? enemy.gridY : Math.floor(enemy.y / tileSize);

        const playerHead = helpers.getPlayerHead ? helpers.getPlayerHead() : null;
        const playerX = playerHead ? playerHead.x : Math.floor(this.player.segments[0].x);
        const playerY = playerHead ? playerHead.y : Math.floor(this.player.segments[0].y);

        const dx = playerX - enemyX;
        const dy = playerY - enemyY;

        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        const newGridX = enemyX + stepX;
        const newGridY = enemyY + stepY;

        enemy.gridX = newGridX;
        enemy.gridY = newGridY;
        enemy.x = newGridX * tileSize;
        enemy.y = newGridY * tileSize;

        await new Promise(res => setTimeout(res, 120));
    }
}