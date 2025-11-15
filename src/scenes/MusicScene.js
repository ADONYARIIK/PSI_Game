import Phaser from 'phaser';

export default class MusicScene extends Phaser.Scene {
    constructor() {
        super('MusicScene');
    }

    create() {
        if (!this.registry.get('music')) {
            const music = this.sound.add('theme', { loop: true, volume: 0.5 });
            music.play();
            this.registry.set('music', music);
        }
    }
}