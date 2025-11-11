import { frameName, FRAME_CONFIG } from './consts.js';

export default class Decor {
    constructor(scene, x, y, opts = {}, name, depth = 0) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.atlas = FRAME_CONFIG.atlasKey;
        this.name = name;
        this.anim = opts.animation || false;
        this.flipX = opts.flipX || false;

        const random = Math.floor(Phaser.Math.Between(1, 2));
        let frame = `${this.name}_01`;

        if (this.name === 'bones' || this.name === 'rocks') {
            frame = `${this.name}_0${random}`;
        }

        this.sprite = this.scene.add.sprite(this.x, this.y, this.atlas, frameName(`${frame}`))
            .setOrigin(0)
            .setDepth(depth);

        if (this.flipX) this.sprite.flipX = true;

        if (this.anim && ['torch', 'sideTorch', 'flag', 'candlestick1', 'candlestick2'].includes(name)) {
            this._createAnimation(this.name);

            const delay = Phaser.Math.Between(0, 1000);
            this.scene.time.delayedCall(delay, () => {
                if (this.sprite && this.sprite.play) {
                    this.sprite.play(`${this.name}_anim`);

                    const startFrame = Phaser.Math.Between(0, 3);
                    this.scene.time.delayedCall(50, () => {
                        const anim = this.sprite.anims?.currentAnim;
                        if (anim && anim.frames && anim.frames.length > 0) {
                            const frameIndex = startFrame % anim.frames.length;
                            this.sprite.anims.setCurrentFrame(anim.frames[frameIndex]);
                        }
                    });
                }
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

        const frameRate = Phaser.Math.Between(4, 7);

        this.scene.anims.create({
            key: animKey,
            frames,
            frameRate,
            repeat: -1
        });
    }

    setDepth(depth) {
        this.sprite.setDepth(depth);
    }
}