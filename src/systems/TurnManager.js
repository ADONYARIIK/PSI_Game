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
        const enemyX = enemy.gridX;
        const enemyY = enemy.gridY;

        const playerHead = helpers.getPlayerHead();
        const playerX = playerHead.x;
        const playerY = playerHead.y;

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        const validDirections = directions.filter(({ dx, dy }) => {
            const newX = enemyX + dx;
            const newY = enemyY + dy;

            if (helpers.isWallAt(newX, newY)) return false;

            const hasEnemy = helpers.getEnemyAt ? helpers.getEnemyAt(newX, newY) : false;
            if (hasEnemy) return false;

            return true;
        });

        if (validDirections.length === 0) return;

        let bestDirection = validDirections[0];
        let bestDistance = Infinity;

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

        const newGridX = enemyX + bestDirection.dx;
        const newGridY = enemyY + bestDirection.dy;

        enemy.gridX = newGridX;
        enemy.gridY = newGridY;
        enemy.x = newGridX * 16;
        enemy.y = newGridY * 16;

        await new Promise(res => setTimeout(res, 150));
    }
}