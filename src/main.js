import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenu from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1120,
  height: 640,
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
  scene: [BootScene, MainMenu, GameScene, UIScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
