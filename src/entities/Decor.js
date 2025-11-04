import { TILE_SIZE, frameName, FRAME_CONFIG } from './consts.js';

export default class Decor {
    constructor(scene, x, y, opts = {}, name) {
        this.scene = scene;
        this.tileSize = TILE_SIZE;
        this.x = x * this.tileSize;
        this.y = y * this.tileSize;
        this.atlas = FRAME_CONFIG.atlasKey;
        this.name = name;
        this.anim = opts.animation || false;
        this.flipX = opts.flipX || false;

        const random = Math.floor(Phaser.Math.Between(1, 2));
        let frame = `${name}_01`;

        if (name === 'bones' || name === 'rocks') {
            frame = `${name}_0${random}`;
        }

        this.sprite = this.scene.add.sprite(this.x, this.y, this.atlas, frameName(`${frame}`)).setOrigin(0).setDepth(0);

        if (this.flipX) this.sprite.flipX = true;

        if (this.anim && ['torch', 'sideTorch', 'flag'].includes(name)) {
            this._createAnimation(name);

            const delay = Phaser.Math.Between(0, 500);
            this.scene.time.delayedCall(delay, () => {
                this.sprite.play(`${name}_anim`);

                this.scene.time.delayedCall(Phaser.Math.Between(50, 150), () => {
                    const anim = this.sprite.anims?.setCurrentAnim;
                    if (anim && anim.frames.length > 0) {
                        const randomFrame = Phaser.Math.Between(0, anim.frames.length - 1);
                        this.sprite.anims.setCurrentFrame(anim.frames[randomFrame]);
                    }
                })
            });
        }
    }

    _createAnimation(name) {
        const animKey = `${name}_anim`;

        if (this.scene.anims.exists(animKey)) return;

        const frames = this.scene.anims.generateFrameNames(this.atlas, {
            prefix: `${name}_0`,
            start: 1,
            end: 4,
            zeroPad: 1,
            suffix: '.png'
        });

        const frameRate = Phaser.Math.Between(5, 8);

        this.scene.anims.create({
            key: animKey,
            frames,
            frameRate,
            repeat: -1
        });
    }
}