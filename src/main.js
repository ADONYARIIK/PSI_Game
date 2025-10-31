import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  backgroundColor: '#000000',
  pixelArt: true,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [BootScene, GameScene, UIScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
