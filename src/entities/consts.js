export const TILE_SIZE = 16;

export const TEXTURES = {
    floor: Array.from({ length: 18 }, (_, i) => `floor_${String(i + 1).padStart(2, '0')}`),
    floorEdge: Array.from({ length: 9 }, (_, i) => `floorEdge_${String(i + 1).padStart(2, '0')}`),
    floorEdgeCorner: Array.from({ length: 4 }, (_, i) => `floorEdgeCorner_${String(i + 1).padStart(2, '0')}`),
    wallTop: Array.from({ length: 4 }, (_, i) => `wallTop_${String(i + 1).padStart(2, '0')}`),
    wallBottom: Array.from({ length: 6 }, (_, i) => `wallBottom_${String(i + 1).padStart(2, '0')}`),
    wallVertical: Array.from({ length: 8 }, (_, i) => `wallVertical_${String(i + 1).padStart(2, '0')}`),
    wallCorner: Array.from({ length: 2 }, (_, i) => `wallCorner_${String(i + 1).padStart(2, '0')}`),
    wallBottomCorner: ['wallBottomCorner'],
    abyss: ['abyss'],

    food: ['apple', 'banana', 'bellpepper', 'blueberry', 'cake', 'cherry', 'espresso', 'garlic', 'jalapeno', 'orange', 'tomato', 'watermelon'],
    coin: Array.from({ length: 4 }, (_, i) => `coin_${String(i + 1).padStart(2, '0')}`),
    smallRedFlask: Array.from({ length: 4 }, (_, i) => `smallRedFlask_${String(i + 1).padStart(2, '0')}`),
    bigRedFlask: Array.from({ length: 4 }, (_, i) => `bigRedFlask_${String(i + 1).padStart(2, '0')}`),
    smallBlueFlask: Array.from({ length: 4 }, (_, i) => `smallBlueFlask_${String(i + 1).padStart(2, '0')}`),
    bigBlueFlask: Array.from({ length: 4 }, (_, i) => `bigBlueFlask_${String(i + 1).padStart(2, '0')}`),
    silverKey: Array.from({ length: 4 }, (_, i) => `silverKey_${String(i + 1).padStart(2, '0')}`),
    goldKey: Array.from({ length: 4 }, (_, i) => `goldKey_${String(i + 1).padStart(2, '0')}`),

    enemy: {
        priestSpear: Array.from({ length: 4 }, (_, i) => `priest1_${String(i + 1).padStart(2, '0')}`),
        priestHand: Array.from({ length: 4 }, (_, i) => `priest2_${String(i + 1).padStart(2, '0')}`),
        priestSword: Array.from({ length: 4 }, (_, i) => `priest3_${String(i + 1).padStart(2, '0')}`),
        skeletonScythe: Array.from({ length: 4 }, (_, i) => `skeleton1_${String(i + 1).padStart(2, '0')}`),
        skeletonSword: Array.from({ length: 4 }, (_, i) => `skeleton2_${String(i + 1).padStart(2, '0')}`),
        skull: Array.from({ length: 4 }, (_, i) => `skull_${String(i + 1).padStart(2, '0')}`),
        vampire: Array.from({ length: 4 }, (_, i) => `vampire_${String(i + 1).padStart(2, '0')}`),
    },
}

export const SPAWN_WEIGHTS = {
    rates: {
        food: 0.6,
        coin: 0.5,
        potion: 0.3,
        key: 0.1,
        enemy: 0.4
    },

    food: [
        { key: 'apple', weight: 10 },
        { key: 'banana', weight: 8 },
        { key: 'bellpepper', weight: 7 },
        { key: 'blueberry', weight: 6 },
        { key: 'cake', weight: 3 },
        { key: 'cherry', weight: 9 },
        { key: 'espresso', weight: 5 },
        { key: 'garlic', weight: 4 },
        { key: 'jalapeno', weight: 3 },
        { key: 'orange', weight: 8 },
        { key: 'tomato', weight: 7 },
        { key: 'watermelon', weight: 2 }
    ],

    potion: [
        { key: 'smallRedFlask', weight: 6 },
        { key: 'bigRedFlask', weight: 2 },
        { key: 'smallBlueFlask', weight: 5 },
        { key: 'bigBlueFlask', weight: 1 }
    ],

    key: [
        { key: 'silverKey', weight: 3 },
        { key: 'goldKey', weight: 1 }
    ]
};

export const ENEMY_STATS = {
    priestSpear: { health: 3, damage: 1, weight: 8 },
    priestHand: { health: 2, damage: 1, weight: 10 },
    priestSword: { health: 4, damage: 2, weight: 5 },
    skeletonScythe: { health: 3, damage: 2, weight: 6 },
    skeletonSword: { health: 3, damage: 1, weight: 7 },
    skull: { health: 2, damage: 1, weight: 9 },
    vampire: { health: 5, damage: 3, weight: 3 }
};

export const SPAWN_COUNTS = {
    food: { min: 1, max: 4, largeBonus: 1 },
    coin: { min: 1, max: 6, largeBonus: 2 },
    potion: { min: 1, max: 2, largeBonus: 1 },
    key: { min: 1, max: 1, largeBonus: 0 },
    enemy: { min: 0, max: 3, largeBonus: 1 }
};

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