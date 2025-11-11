import SnakePlayer from '../entities/SnakePlayer.js';
import Decor from '../entities/Decor.js';
import { Directions } from '../entities/consts.js';

export function createSnake(scene, startRoom, offset, initialDirection = 'Right') {
    if (!startRoom) {
        return null;
    }

    // const safeX = startRoom.x + 2;
    // const safeY = startRoom.y + 2;

    const safeX = startRoom.x + Math.floor(startRoom.width / 2);
    const safeY = startRoom.y + Math.floor(startRoom.height / 2);

    const worldX = safeX + offset.offsetX;
    const worldY = safeY + offset.offsetY;

    const snake = new SnakePlayer(scene, worldX, worldY, { startLength: 3 });

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