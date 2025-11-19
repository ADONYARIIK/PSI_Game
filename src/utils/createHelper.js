import SnakePlayer from '../entities/SnakePlayer.js';
import Decor from '../entities/Decor.js';
import { Directions } from '../entities/consts.js';

export function createSnake(scene, startRoom, initialDirection = 'Right', grow) {
    if (!startRoom) {
        return null;
    }

    const x = startRoom.x + Math.floor(startRoom.width / 2);
    const y = startRoom.y + Math.floor(startRoom.height / 2);

    const snake = new SnakePlayer(scene, x, y, { startLength: 3, startGrow:grow-3 });

    if (initialDirection && typeof initialDirection === 'string') {
        const d = Object.values(Directions).find(dd => dd.name === initialDirection);
        if (d) snake.direction = d;
    }

    return snake;
}

export function createDecor(scene, x, y, props = {}, name, depth = 0) {
    const decor = new Decor(scene, x, y, props, name, depth);
    return decor;
}