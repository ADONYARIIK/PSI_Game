export const TILE_SIZE = 16;

export const Directions = {
    UP: { x: 0, y: -1, name: 'Top' },
    DOWN: { x: 0, y: 1, name: 'Down' },
    LEFT: { x: -1, y: 0, name: 'Left' },
    RIGHT: { x: 1, y: 0, name: 'Right' }
};

export const SnakeState = {
    IDLE: 'idle',
    MOVE: 'move',
    EAT: 'eat',
    SHOCK: 'shock'
};

export const FRAME_CONFIG = {
    atlasKey: 'sprites'
}

export function frameName(base) {
    return base.endsWith('.png') ? base : `${base}.png`;
}