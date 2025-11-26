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

    exitClose: ['hatch'],
    exitOpen: ['ladder'],

    food: ['apple', 'bellpepper', 'blueberry', 'cake', 'cherry', 'espresso', 'garlic', 'jalapeno', 'orange', 'tomato', 'watermelon'],
    coin: Array.from({ length: 4 }, (_, i) => `coin_${String(i + 1).padStart(2, '0')}`),
    smallRedFlask: Array.from({ length: 4 }, (_, i) => `smallRedFlask_${String(i + 1).padStart(2, '0')}`),
    bigRedFlask: Array.from({ length: 4 }, (_, i) => `bigRedFlask_${String(i + 1).padStart(2, '0')}`),
    smallBlueFlask: Array.from({ length: 4 }, (_, i) => `smallBlueFlask_${String(i + 1).padStart(2, '0')}`),
    bigBlueFlask: Array.from({ length: 4 }, (_, i) => `bigBlueFlask_${String(i + 1).padStart(2, '0')}`),

    enemy: {
        priestSpear: Array.from({ length: 4 }, (_, i) => `priest1_${String(i + 1).padStart(2, '0')}`),
        priestHand: Array.from({ length: 4 }, (_, i) => `priest2_${String(i + 1).padStart(2, '0')}`),
        priestSword: Array.from({ length: 4 }, (_, i) => `priest3_${String(i + 1).padStart(2, '0')}`),
        skeletonScythe: Array.from({ length: 4 }, (_, i) => `skeleton1_${String(i + 1).padStart(2, '0')}`),
        skeletonSword: Array.from({ length: 4 }, (_, i) => `skeleton2_${String(i + 1).padStart(2, '0')}`),
        skull: Array.from({ length: 4 }, (_, i) => `skull_${String(i + 1).padStart(2, '0')}`),
        vampire: Array.from({ length: 4 }, (_, i) => `vampire_${String(i + 1).padStart(2, '0')}`),
    },
};

export const ITEM_PROPERTIES = {
    apple: {
        type: 'food',
        healthGain: 1,
        maxHealthIncrease: 1,
        lengthGain: 1,
        immediate: false,
        price: 1
    },
    bellpepper: {
        type: 'food',
        healthGain: 2,
        maxHealthIncrease: 1,
        lengthGain: 1,
        immediate: false,
        price: 1
    },
    blueberry: {
        type: 'food',
        shield: 2,
        shieldDuration: 3,
        lengthGain: 1,
        immediate: false,
        price: 2
    },
    cake: {
        type: 'food',
        healthGain: 2,
        maxHealthIncrease: 2,
        lengthGain: 4,
        immediate: false,
        price: 4
    },
    cherry: {
        type: 'food',
        regen: 1,
        regenDuration: 3,
        lengthGain: 1,
        immediate: false,
        price: 3
    },
    espresso: {
        type: 'food',
        doubleMove: true,
        doubleMoveDuration: 3,
        lengthGain: 1,
        immediate: false,
        price: 5
    },
    garlic: {
        type: 'food',
        healthLoss: 1,
        vampireDamage: 2,
        vampireDuration: 3,
        lengthGain: 1,
        immediate: false,
        price: 3
    },
    jalapeno: {
        type: 'food',
        healthLoss: 2,
        damageBoost: 2,
        damageDuration: 3,
        lengthLoss: 1,
        immediate: false,
        price: 5
    },
    orange: {
        type: 'food',
        healthGain: 1,
        lengthGain: 1,
        immediate: false,
        price: 1
    },
    tomato: {
        type: 'food',
        healthGain: 1,
        lengthGain: 1,
        immediate: false,
        price: 1
    },
    watermelon: {
        type: 'food',
        tempLength: 3,
        tempLengthDuration: 10,
        immediate: false,
        price: 2
    },

    smallRedFlask: {
        type: 'potion',
        regen: 2,
        regenDuration: 3,
        immediate: false,
        price: 5
    },
    bigRedFlask: {
        type: 'potion',
        maxHealthIncrease: 2,
        immediate: false,
        price: 7
    },
    smallBlueFlask: {
        type: 'potion',
        shield: 1,
        shieldDuration: 3,
        immediate: false,
        price: 4
    },
    bigBlueFlask: {
        type: 'potion',
        permanentShield: 1,
        damageReduction: 1,
        immediate: false,
        price: 10
    }
};

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
    ]
};

export const ENEMY_STATS = {
    priestSpear: {
        health: 3,
        damage: 2,
        weight: 8,
        shield: 3,
        range: 2,
        sight: 8,
        moveRadius: 5
    },
    priestHand: {
        health: 5,
        damage: 1,
        weight: 10,
        shield: 3,
        range: 1,
        sight: 5,
        moveRadius: 5
    },
    priestSword: {
        health: 4,
        damage: 3,
        weight: 5,
        shield: 3,
        range: 1,
        sight: 8,
        moveRadius: 8
    },
    skeletonScythe: {
        health: 2,
        damage: 4,
        weight: 6,
        shield: 1,
        range: 2,
        sight: 5,
        moveRadius: 0
    },
    skeletonSword: {
        health: 2,
        damage: 3,
        weight: 7,
        shield: 2,
        range: 1,
        sight: 5,
        moveRadius: 0
    },
    skull: {
        health: 4,
        damage: 2,
        weight: 9,
        shield: 0,
        range: 1,
        sight: 0,
        moveRadius: 0,
        moveCooldown: 2
    },
    vampire: {
        health: 6,
        damage: 3,
        weight: 3,
        shield: 4,
        range: 1,
        sight: 10,
        moveRadius: 6,
        lifesteal: true
    }
};

export const SPAWN_COUNTS = {
    food: { min: 1, max: 4, largeBonus: 1 },
    coin: { min: 1, max: 6, largeBonus: 2 },
    potion: { min: 1, max: 2, largeBonus: 1 },
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