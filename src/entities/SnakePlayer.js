import { TILE_SIZE, Directions, SnakeState, frameName, FRAME_CONFIG } from './consts.js';
import { frameSequenceFor } from '../utils/frameUtils.js';

export default class SnakePlayer {
    constructor(scene, startX, startY, opts = {}) {
        this.scene = scene;
        this.atlas = FRAME_CONFIG.atlasKey;
        this.maxInputQueue = opts.maxInputQueue || 3;

        this.state = SnakeState.IDLE;
        this.direction = Directions.RIGHT;
        this.grow = opts.startGrow || 0;

        const startLen = opts.startLength || 3;
        this.segments = [];
        for (let i = 0; i < startLen; i++) {
            this.segments.push({ x: startX - i, y: startY });
        }

        this.occupancy = new Set();
        this.segments.forEach(s => this.occupancy.add(this._key(s.x, s.y)));

        this.sprites = [];

        this.headSprite = this.scene.add.image(
            this.segments[0].x * TILE_SIZE,
            this.segments[0].y * TILE_SIZE,
            this.atlas,
            frameName(`snake_head${this.direction.name}`)
        ).setOrigin(0).setDepth(7);

        this.sprites.push(this.headSprite)

        for (let i = 1; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const spr = this.scene.add.image(
                seg.x * TILE_SIZE,
                seg.y * TILE_SIZE,
                this.atlas,
                frameName('snake_bodyHorizontal')
            ).setOrigin(0).setDepth(6);
            this.sprites.push(spr);
        }

        this._updateBodyFrames();

        this.inputQueue = [];

        this.locked = false;
    }

    enqueueDirection(dir) {
        if (!dir) return;

        const lastDir = this.inputQueue.length ? this.inputQueue[this.inputQueue.length - 1] : this.direction;

        if (dir.x === -lastDir.x && dir.y === -lastDir.y) return;

        if (dir.x === lastDir.x && dir.y === lastDir.y) return;

        if (this.inputQueue.length < this.maxInputQueue) {
            this.inputQueue.push(dir);
        }
    }

    async takeTurn(dir = null, helpers = {}) {
        if (this.locked) return { skipped: true };
        this.locked = true;

        if (dir) {
            if (!(dir.x === -this.direction.x && dir.y === -this.direction.y)) {
                this.direction = dir;
            }
        } else {
            const next = this._popNextDirection();
            if (!(next.x === -this.direction.x && next.y === -this.direction.y)) {
                this.direction = next;
            }
        }

        const head = this.segments[0];
        const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

        const isWallAt = helpers.isWallAt || (() => false);
        const getEntityAt = helpers.getEntityAt || (() => null);
        const onEat = helpers.onEat || (() => { });
        const onCollide = helpers.onCollide || (() => { });

        if (isWallAt(newHead.x, newHead.y)) {
            console.log('Wall collision detected');
            await this._animateHeadShock(this.direction);
            this.locked = false;
            return { died: true, reason: 'wall' };
        }

        const willRemoveTail = this.grow === 0;

        if (this._willSelfCollide(newHead, willRemoveTail)) {
            await this._animateHeadShock(this.direction);
            this.locked = false;
            return { died: true, reason: 'self' };
        }

        const entity = getEntityAt(newHead.x, newHead.y);

        if (entity && entity.type === 'enemy') {
            await this._animateHeadShock(this.direction);
            onCollide(entity);
            this.locked = false;
            return { died: false, collideWith: entity };
        }

        await this._animateAllSegments();

        this.segments.unshift(newHead);
        this.occupancy.add(this._key(newHead.x, newHead.y));

        if (this.grow > 0) {
            this.grow--;
        }
        else {
            const tail = this.segments.pop();
            this.occupancy.delete(this._key(tail.x, tail.y));
        }

        this.syncSpritesToSegments();

        const entityAfterMove = getEntityAt(newHead.x, newHead.y);
        if (entityAfterMove && entityAfterMove.type !== 'enemy') {
            this.grow += entityAfterMove.growAmount || 0;
            await this._animateHeadEat(this.direction);
            onEat(entityAfterMove);
        }

        this.locked = false;
        return { died: false, ate: !!entity, collideWith: null };
    }


    async _animateAllSegments() {
        const promises = [];

        promises.push(this._animateHeadMove(this.direction));

        if (this.segments.length > 1) {
            for (let i = 1; i < this.segments.length; i++) {
                const prevSeg = this.segments[i - 1];
                const currSeg = this.segments[i];

                if (prevSeg.x !== currSeg.x || prevSeg.y !== currSeg.y) {
                    const sprite = this.sprites[i];
                    promises.push(this._tweenSegment(sprite, prevSeg.x * TILE_SIZE, prevSeg.y * TILE_SIZE));
                }
            }
        }

        await Promise.all(promises);
    }

    _tweenSegment(sprite, targetX, targetY) {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: sprite,
                x: targetX,
                y: targetY,
                duration: 180,
                ease: 'Linear',
                onComplete: resolve
            });
        });
    }

    _animateHeadMove(direction) {
        return this._tweenHeadToNextTile(direction, frameSequenceFor(direction, 'idle'));
    }

    _animateHeadEat(direction) {
        return this._tweenHeadToNextTile(direction, frameSequenceFor(direction, 'eat', { duration: 200 }));
    }

    _animateHeadShock(direction) {
        return this._tweenHeadToNextTile(direction, frameSequenceFor(direction, 'shock'), { duration: 300, shake: true });
    }

    _tweenHeadToNextTile(direction, frames = [], options = {}) {
        const duration = options.duration || 180;
        const startX = this.headSprite.x;
        const startY = this.headSprite.y;
        const endX = startX/* + direction.x * TILE_SIZE*/;
        const endY = startY/* + direction.y * TILE_SIZE*/;

        return new Promise(resolve => {
            let frameIndex = 0;
            const frameTimer = this.scene.time.addEvent({
                delay: Math.max(1, Math.floor(duration / Math.max(1, frames.length))),
                repeat: Math.max(0, frames.length - 1),
                callback: () => {
                    const frameBase = frames[Math.min(frameIndex, frames.length - 1)];
                    this.headSprite.setFrame(frameName(frameBase));
                    frameIndex++;
                }
            });

            const tweenCfg = {
                targets: this.headSprite,
                x: endX,
                y: endY,
                duration,
                ease: 'Linear',
                onComplete: () => {
                    frameTimer.remove(false);
                    this.headSprite.setFrame(frameName(`snake_head${direction.name}`));
                    resolve();
                }
            };

            if (options.shake) {
                this.scene.cameras.main.shake(250, 0.005);
            }

            this.scene.tweens.add(tweenCfg);
        });
    }


    syncSpritesToSegments() {
        while (this.sprites.length < this.segments.length) {
            const spr = this.scene.add.image(0, 0, this.atlas, frameName('snake_bodyHorizontal')).setOrigin(0).setDepth(6);
            this.sprites.push(spr);
        }
        while (this.sprites.length > this.segments.length) {
            const spr = this.sprites.pop();
            spr.destroy();
        }

        const headSeg = this.segments[0];
        this.headSprite.x = headSeg.x * TILE_SIZE;
        this.headSprite.y = headSeg.y * TILE_SIZE;

        for (let i = 1; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const spr = this.sprites[i];
            spr.x = seg.x * TILE_SIZE;
            spr.y = seg.y * TILE_SIZE;
        }

        this._updateBodyFrames();
    }

    _updateBodyFrames() {
        for (let i = 0; i < this.segments.length; i++) {
            const sprite = this.sprites[i];
            const curr = this.segments[i];

            if (i === 0) {
                this.headSprite.setFrame(frameName(`snake_head${this.direction.name}`));
                continue;
            }

            if (i === this.segments.length - 1) {
                const prev = this.segments[i - 1];
                const dx = curr.x - prev.x;
                const dy = curr.y - prev.y;

                if (dx === 1) sprite.setFrame(frameName('snake_tailLeft'));
                else if (dx === -1) sprite.setFrame(frameName('snake_tailRight'));
                else if (dy === 1) sprite.setFrame(frameName('snake_tailTop'));
                else sprite.setFrame(frameName('snake_tailDown'));
                continue;
            }

            const prev = this.segments[i - 1];
            const next = this.segments[i + 1];

            const dxPrev = prev.x - curr.x;
            const dyPrev = prev.y - curr.y;
            const dxNext = next.x - curr.x;
            const dyNext = next.y - curr.y;

            if (dyPrev === 0 && dyNext === 0) {
                sprite.setFrame(frameName('snake_bodyHorizontal'));
                continue;
            }

            if (dxPrev === 0 && dxNext === 0) {
                sprite.setFrame(frameName('snake_bodyVertical'));
                continue;
            }

            if ((dxPrev === 0 && dyPrev === -1 && dxNext === 1 && dyNext === 0) || (dxPrev === 1 && dyPrev == 0 && dxNext === 0 && dyNext === -1)) {
                sprite.setFrame(frameName('snake_bodyRightTop'));
            } else if ((dxPrev === 0 && dyPrev === 1 && dxNext === 1 && dyNext === 0) || (dxPrev === 1 && dyPrev === 0 && dxNext === 0 && dyNext === 1)) {
                sprite.setFrame(frameName('snake_bodyRightDown'));
            } else if ((dxPrev === 0 && dyPrev === -1 && dxNext === -1 && dyNext === 0) || (dxPrev === -1 && dyPrev === 0 && dxNext === 0 && dyNext === -1)) {
                sprite.setFrame(frameName('snake_bodyLeftTop'));
            } else if ((dxPrev === 0 && dyPrev === 1 && dxNext === -1 && dyNext === 0) || (dxPrev === -1 && dyPrev === 0 && dxNext === 0 && dyNext === 1)) {
                sprite.setFrame(frameName('snake_bodyLeftDown'));
            } else {
                sprite.setFrame(frameName('snake_bodyHorizontal'));
            }
        }
    }


    _key(x, y) {
        return `${x},${y}`;
    }

    _popNextDirection() {
        if (this.inputQueue.length) return this.inputQueue.shift();
        return this.direction;
    }

    _willSelfCollide(newHead, willRemoveTail) {
        const key = this._key(newHead.x, newHead.y);
        if (!this.occupancy.has(key)) return false;
        if (willRemoveTail) {
            const tail = this.segments[this.segments.length - 1];
            if (tail.x === newHead.x && tail.y === newHead.y) return false;
        }
        return true;
    }


    debugLog() {
        console.log('Segments: ', this.segments);
        console.log('Occupancy size: ', this.occupancy.size)
    }

    getHeadPos() {
        return { ...this.segments[0] };
    }

    getLength() {
        return this.segments.length;
    }

    getDirection() {
        return this.direction;
    }
}