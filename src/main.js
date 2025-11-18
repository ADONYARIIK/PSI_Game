import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenu from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import AuthorsScene from './scenes/AuthorsScene.js';
import MusicScene from './scenes/MusicScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import ShopScene from './scenes/ShopScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1120,
  height: 640,
  backgroundColor: '#000000',
  pixelArt: true,
  parent: 'game-container',
  scene: [BootScene, MainMenu, GameScene, UIScene, AuthorsScene, MusicScene, SettingsScene, ShopScene, GameOverScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
