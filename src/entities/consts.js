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
        healthGain: 4,
        maxHealthIncrease: 3,
        lengthGain: 2,
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
        { key: 'apple', weight: 10 },// должен добавлять один хп к максимуму и регенить, даёт 1 длины
        { key: 'bellpepper', weight: 7 },// добавляет один хп к максимуму и регенит два, даёт 1 длины
        { key: 'blueberry', weight: 6 },// даёт щит на одно получение урона(делает минус два урона) который длится три хода, даёт 1 длины
        { key: 'cake', weight: 3 },// увеличивает макс хп на три, регенит 4, даёт 2 длины
        { key: 'cherry', weight: 9 },// в течении трёх ходов регенит по одному хп, даёт 1 длины
        { key: 'espresso', weight: 5 },// во время своего хода игрок может передвигаться два раза подряд или атаковать два раза подряд, даёт 1 длины
        { key: 'garlic', weight: 4 },// наносит один урон при употреблении но увиличивает урон против вампиров на 2 в течении трёх ходов, даёт 1 длины
        { key: 'jalapeno', weight: 3 },// наносит два урона при употреблении но увеличивает весь наносимый урон на 2 в течении трёх ходов, отнимает 1 длины
        { key: 'orange', weight: 8 },// регенит 1 хп, даёт 1 длины
        { key: 'tomato', weight: 7 },// регенит 1 хп, даёт 1 длины
        { key: 'watermelon', weight: 2 }// даёт 3 длины которые пропадают через 6 ходов
    ],

    potion: [
        { key: 'smallRedFlask', weight: 6 },// регенит 2 хп в течении трёх ходов
        { key: 'bigRedFlask', weight: 2 },// увеличивает макс хп на 2
        { key: 'smallBlueFlask', weight: 5 },// даёт щит уменьшающий урон на 1 в течении трёх ходов
        { key: 'bigBlueFlask', weight: 1 }// даёт постоянный щит уменьшающий урон 1 но уменьшает макс урон на 1
    ]
};

export const ENEMY_STATS = {
    priestSpear: { health: 3, damage: 1, weight: 8, shield: 3, range: 2, sight: 8, moveRadius: 5 },// хп 3, щит 3, атк 2, дальность атаки 2 тайла, если не видит игрока ходит на один тайл в радиусе 5 тайлов от своего спавна, если увидит игрока в пределах 8 тайлов от себя движется в его сторону игнорируя изначальный ограничитель в виде 5 тайлов
    priestHand: { health: 2, damage: 1, weight: 10, shield: 3, range: 1, sight: 5, moveRadius: 5 },// хп 5, щит 3, атк 1, дальность атаки 1 тайл, если не видит игрока ходит на два тайла в радиусе 5 тайлов от своего спавна, когда увидит игрока в радиусе 5 тайлов от себя движется в его сторону игнорируя ограничитель
    priestSword: { health: 4, damage: 2, weight: 5, shield: 3, range: 1, sight: 8, moveRadius: 8 },// хп 4, щит 3, атк 3, дальность атаки 1 тайл, ходит на один тайл в радиусе 8 тайлов от спавна, когда видит игрока в радиусе 8 тайлов от себя, идёт в его сторону
    skeletonScythe: { health: 3, damage: 2, weight: 6, shield: 1, range: 2, sight: 5, moveRadius: 0 },// хп 2, щит 1, атк 4, дальность атаки 2 тайла, ходит на один тайл по всей карте, если видит игрока в пределах 5 тайлов от себя движется к нему
    skeletonSword: { health: 3, damage: 1, weight: 7, shield: 2, range: 1, sight: 5, moveRadius: 0 },// хп 2, щит 2, атк 3, дальность атаки 1 тайл, ходит на один тайл по всей карте, если видит игрока в пределах пять тайлов идёт к нему
    skull: { health: 2, damage: 1, weight: 9, shield: 0, range: 1, sight: 0, moveRadius: 0, moveCooldown: 2 },// хп 4, щит 0, атк 2, дальность атаки 1 тайл, ходит на 1 тайл раз в два хода в пределах комнаты спавна, если игрок заходит в комнату движется к нему
    vampire: { health: 5, damage: 3, weight: 3, shield: 4, range: 1, sight: 10, moveRadius: 6, lifesteal: true }// хп 6, щит 4, атк 3, при атаке регенерирует на 1 хп, дальность атаки 1 тайл, стоит на месте пока игрок не появится в пределах 10 тайлов, начинает двигатся по одному тайлу в его сторону, когда игрок находится в пределах 6 тайлов, двигается на 2 тайла за ход

    // все враги: если становятся боссами все характеристики кроме защиты умножаются на два, защита остаётся прежней у всех кроме черепа и вампира, у черепа увеличивается на 1, а у вампира умножается на полтора
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