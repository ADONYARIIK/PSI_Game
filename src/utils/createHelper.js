import SnakePlayer from '../entities/SnakePlayer.js';
import Decor from '../entities/Decor.js';
import { TILE_SIZE, Directions } from '../entities/consts.js';

export function createSnake(scene, x, y, initialDirection = 'Right') {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    const snake = new SnakePlayer(scene, tileX, tileY, { startLength: 5 });

    if (initialDirection && typeof initialDirection === 'string') {
        const d = Object.values(Directions).find(dd => dd.name === initialDirection);
        if (d) snake.direction = d;
    }

    return snake;
}

export function createDecor(scene, x, y, props = {}, name) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    const anim = props.animation;
    const flipX = props.flipX;

    const decor = new Decor(scene, tileX, tileY, { animation: anim, flipX: flipX }, name);

    return decor;
}