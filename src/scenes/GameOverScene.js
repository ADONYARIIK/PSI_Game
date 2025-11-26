import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.gameData = data;
    }

    create() {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setDepth(0);

        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 250,
            'GAME OVER',
            {
                fontFamily: '"Jacquard 12"',
                fontSize: '64px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        const statsText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            `Level Reached: ${this.gameData.level}\n\nFinal Score: ${this.gameData.scores}\n\nCoins Collected: ${this.gameData.coins}\n\nSnake Length: ${this.gameData.playerLength}`,
            {
                fontFamily: '"Jacquard 12"',
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);

        const restartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 150,
            'Restart from Level 1',
            {
                fontFamily: '"Jacquard 12"',
                fontSize: '36px',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartButton.on('pointerover', () => {
            restartButton.setStyle({ fill: '#ffff00' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ fill: '#ffffff' });
        });

        restartButton.on('pointerdown', () => {
            this.restartGame();
        });

        const menuButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 220,
            'Main Menu',
            {
                fontFamily: '"Jacquard 12"',
                fontSize: '36px',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setStyle({ fill: '#ffff00' });
        });

        menuButton.on('pointerout', () => {
            menuButton.setStyle({ fill: '#ffffff' });
        });

        menuButton.on('pointerdown', () => {
            this.returnToMainMenu();
        });

        gameOverText.setAlpha(0);
        statsText.setAlpha(0);
        restartButton.setAlpha(0);
        menuButton.setAlpha(0);

        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: statsText,
            alpha: 1,
            duration: 1000,
            delay: 500,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: restartButton,
            alpha: 1,
            duration: 1000,
            delay: 1000,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: menuButton,
            alpha: 1,
            duration: 1000,
            delay: 1500,
            ease: 'Power2'
        });
    }

    restartGame() {
        this.registry.set('hp', 10);
        this.registry.set('maxHP', 10);
        this.registry.set('baseMaxHP', 10);
        this.registry.set('dmg', 2);
        this.registry.set('baseDmg', 2);
        this.registry.set('permanentShield', 0);
        this.registry.set('coins', 10);
        this.registry.set('scores', 0);
        this.registry.set('level', 1);
        this.registry.set('playerLength', 3);
        this.registry.set('playerInventory', [null, null, null, null, null]);
        this.registry.set('playerItems', []);
        this.registry.set('shopRefresh', 1);
        this.registry.set('refreshPrice', 1);
        this.registry.set('isGameOver', false);

        this.scene.start('GameScene');
    }

    returnToMainMenu() {
        this.registry.set('hp', 10);
        this.registry.set('maxHP', 10);
        this.registry.set('baseMaxHP', 10);
        this.registry.set('dmg', 2);
        this.registry.set('baseDmg', 2);
        this.registry.set('permanentShield', 0);
        this.registry.set('coins', 10);
        this.registry.set('scores', 0);
        this.registry.set('level', 1);
        this.registry.set('playerLength', 3);
        this.registry.set('playerInventory', [null, null, null, null, null]);
        this.registry.set('playerItems', []);
        this.registry.set('shopRefresh', 1);
        this.registry.set('refreshPrice', 1);
        this.registry.set('isGameOver', false);

        this.scene.start('MainMenuScene');
    }
}