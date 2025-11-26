import { RoomTemplates } from "./RoomTemplates";

export function generateRoom(scene, x, y, type = 'normal', orientation = 'any') {
    const template = RoomTemplates[type];
    const [min, max] = template.size;

    let width, height;

    if (type === 'start' || type === 'crossroads' || type === 'square') {
        width = min;
        height = max;
    } else if (type === 'corridor_room') {
        if (orientation === 'horizontal') {
            const [minW, maxW] = template.horizontal.width;
            const [minH, maxH] = template.horizontal.height;
            width = Phaser.Math.Between(minW, maxW);
            height = Phaser.Math.Between(minH, maxH);
        } else if (orientation === 'vertical') {
            const [minW, maxW] = template.vertical.width;
            const [minH, maxH] = template.vertical.height;
            width = Phaser.Math.Between(minW, maxW);
            height = Phaser.Math.Between(minH, maxH);
        } else {
            if (Phaser.Math.Between(0, 1) === 0) {
                const [minW, maxW] = template.horizontal.width;
                const [minH, maxH] = template.horizontal.height;
                width = Phaser.Math.Between(minW, maxW);
                height = Phaser.Math.Between(minH, maxH);
            } else {
                const [minW, maxW] = template.vertical.width;
                const [minH, maxH] = template.vertical.height;
                width = Phaser.Math.Between(minW, maxW);
                height = Phaser.Math.Between(minH, maxH);
            }
        }
    } else {
        width = Phaser.Math.Between(min, max);
        height = Phaser.Math.Between(min, max);
    }

    const room = {
        x, y,
        width, height,
        type: type,
        tiles: [],
        connections: [],
        depth: 0
    }

    for (let row = 0; row < height; row++) {
        const line = [];
        for (let col = 0; col < width; col++) {
            if (row === 0 || row === height - 1 || col === 0 || col === width - 1) {
                line.push('#');
            } else {
                line.push('.');
            }
        }
        room.tiles.push(line);
    }

    applyDecor(scene, room, template.decor);

    return room;
}

export function generateSpecialRoom(scene, x, y, type) {
    return generateRoom(scene, x, y, type);
}

export function chooseRoomTemplate(excludedTypes = [], prefferedTypes = []) {
    const pool = [];

    if (prefferedTypes.length > 0) {
        for (const type of prefferedTypes) {
            const data = RoomTemplates[type];
            if (data && !excludedTypes.includes(type)) {
                for (let i = 0; i < data.chance * 2; i++) {
                    pool.push({ type: type, ...data });
                }
            }
        }
    }

    for (const [key, data] of Object.entries(RoomTemplates)) {
        if (!excludedTypes.includes(key) && !prefferedTypes.includes(key)) {
            for (let i = 0; i < data.chance; i++) {
                pool.push({ type: key, ...data });
            }
        }
    }

    return pool.length > 0 ? Phaser.Utils.Array.GetRandom(pool) : { type: 'normal', ...RoomTemplates.normal };
}


function applyDecor(room, rules) {
    room.decorRules = rules;
}