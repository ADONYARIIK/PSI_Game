import { generateRoom, generateSpecialRoom, chooseRoomTemplate } from './RoomFactory.js';
import { TILE_SIZE } from '../entities/consts';
import { drawTiles } from './TileRenderer.js';
import { MapDecorator } from './MapDecorator.js';
import { EntitySpawner } from '../entities/EntitySpawner.js';

export function generateMap(scene, numRooms = 20) {
    const rooms = [];
    const mapTiles = {};
    const roomTiles = {};

    const startRoom = generateSpecialRoom(scene, 0, 0, 'start');
    startRoom.isStart = true;
    rooms.push(startRoom);
    fillRoom(mapTiles, roomTiles, startRoom);

    generateRoomsAroundStart(scene, rooms, mapTiles, roomTiles, numRooms);

    connectAllRooms(rooms, mapTiles, roomTiles);

    placeSpecialRooms(scene, rooms, mapTiles, roomTiles);

    addCorridorWalls(mapTiles);

    drawTiles(scene, mapTiles, roomTiles);

    const decorator = new MapDecorator(scene, mapTiles, roomTiles, rooms);
    decorator.placeAllDecor();

    const entitySpawner = new EntitySpawner(scene, mapTiles, roomTiles, rooms);
    entitySpawner.spawnAllEntities();

    const start = rooms.find(r => r.isStart);

    const bounds = calculateMapBounds(mapTiles);

    return { rooms, start, bounds, mapTiles, roomTiles };
}

function calculateMapBounds(mapTiles) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const key of Object.keys(mapTiles)) {
        const [x, y] = key.split(',').map(Number);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    const padding = 6;
    const left = (minX - padding) * TILE_SIZE;
    const top = (minY - padding) * TILE_SIZE;
    const right = (maxX + padding) * TILE_SIZE;
    const bottom = (maxY + padding) * TILE_SIZE;

    return {
        left,
        top,
        width: right - left,
        height: bottom - top
    };
}

function addCorridorWalls(mapTiles) {
    const corridorTiles = [];

    for (const [key, value] of Object.entries(mapTiles)) {
        if (value === '.' || value === 'C' || value === 'D') {
            const [x, y] = key.split(',').map(Number);
            corridorTiles.push({ x, y });
        }
    }

    for (const tile of corridorTiles) {
        const { x, y } = tile;

        const neighbors = [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
        ];

        for (const { dx, dy } of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            const key = `${nx},${ny}`;

            if (!mapTiles[key]) {
                mapTiles[key] = '#';
            }
        }
    }

    cleanupCorridorWalls(mapTiles);
}

function cleanupCorridorWalls(mapTiles) {
    const wallsToRemove = [];

    for (const [key, value] of Object.entries(mapTiles)) {
        if (value === '#') {
            const [x, y] = key.split(',').map(Number);

            if (isBlockingImportantPath(mapTiles, x, y)) {
                wallsToRemove.push(key);
            }
        }
    }

    for (const key of wallsToRemove) {
        delete mapTiles[key];
    }
}

function isBlockingImportantPath(mapTiles, x, y) {
    const left = mapTiles[`${x - 1},${y}`];
    const right = mapTiles[`${x + 1},${y}`];

    const up = mapTiles[`${x},${y - 1}`];
    const down = mapTiles[`${x},${y + 1}`];

    if ((left === '.' || left === 'C' || left === 'D') && (right === '.' || right === 'C' || right === 'D')) {
        return true;
    }

    if ((up === '.' || up === 'C' || up === 'D') && (down === '.' || down === 'C' || down === 'D')) {
        return true;
    }

    const topLeft = mapTiles[`${x - 1},${y - 1}`];
    const topRight = mapTiles[`${x + 1},${y - 1}`];
    const bottomLeft = mapTiles[`${x - 1},${y + 1}`];
    const bottomRight = mapTiles[`${x + 1},${y + 1}`];

    if ((topLeft === '.' || topLeft === 'C' || topLeft === 'D') && (bottomRight === '.' || bottomRight === 'C' || bottomRight === 'D')) {
        const horizontalClear = !mapTiles[`${x - 1},${y}`] && !mapTiles[`${x + 1},${y}`];
        const verticalClear = !mapTiles[`${x},${y - 1}`] && !mapTiles[`${x},${y + 1}`];

        if (horizontalClear || verticalClear) {
            return true;
        }
    }

    if ((topRight === '.' || topRight === 'C' || topRight === 'D') && (bottomLeft === '.' || bottomLeft === 'C' || bottomLeft === 'D')) {
        const horizontalClear = !mapTiles[`${x - 1},${y}`] && !mapTiles[`${x + 1},${y}`];
        const verticalClear = !mapTiles[`${x},${y - 1}`] && !mapTiles[`${x},${y + 1}`];

        if (horizontalClear || verticalClear) {
            return true;
        }
    }

    return false;
}

function generateRoomsAroundStart(scene, rooms, mapTiles, roomTiles, targetRoomCount) {
    const directions = [
        { dx: 1, dy: 0, dir: 'right' },
        { dx: -1, dy: 0, dir: 'left' },
        { dx: 0, dy: 1, dir: 'down' },
        { dx: 0, dy: -1, dir: 'up' }
    ];

    let roomCount = 1;
    let attempts = 0;
    const maxAttempts = targetRoomCount * 10;

    let expansionQueue = [...rooms];

    while (roomCount < targetRoomCount && attempts < maxAttempts && expansionQueue.length > 0) {
        attempts++;

        const baseRoom = expansionQueue.shift();
        if (!baseRoom) continue;

        const shuffledDirections = Phaser.Utils.Array.Shuffle([...directions]);

        for (const { dir } of shuffledDirections) {
            if (roomCount >= targetRoomCount) break;

            const hasConnectionInDirection = baseRoom.connections.some(
                conn => conn.direction === dir
            );

            if (hasConnectionInDirection) continue;

            let newRoom;
            const connectionCount = getConnectionCount(baseRoom);

            let orientation = 'any';
            if (dir === 'left' || dir === 'right') {
                orientation = 'horizontal';
            } else if (dir === 'up' || dir === 'down') {
                orientation = 'vertical';
            }

            if (connectionCount >= 2 && Phaser.Math.Between(1, 100) <= 30) {
                newRoom = generateSpecialRoom(scene, 0, 0, 'crossroads');
            } else {
                const excludedTypes = ['start', 'treasure', 'boss'];
                const preferredTypes = [];

                const depth = baseRoom.depth + 1;
                if (depth <= 2) {
                    preferredTypes.push('normal', 'square');
                } else if (depth >= 4) {
                    preferredTypes.push('hall', 'obstacle_course');
                }

                const baseSpacing = 15;
                const roomSpacing = baseSpacing + Phaser.Math.Between(-2, 5);
                if (roomSpacing > 18) {
                    preferredTypes.push('corridor_room');
                }

                const template = chooseRoomTemplate(excludedTypes, preferredTypes);
                newRoom = generateRoom(scene, 0, 0, template.type, orientation);
            }

            const baseSpacing = 15;
            const roomSpacing = baseSpacing + Phaser.Math.Between(-2, 5);

            let newX, newY;

            switch (dir) {
                case 'right':
                    newX = baseRoom.x + baseRoom.width + roomSpacing;
                    newY = baseRoom.y + Phaser.Math.Between(-Math.floor(baseRoom.height / 3), Math.floor(baseRoom.height / 3));
                    break;
                case 'left':
                    newX = baseRoom.x - newRoom.width - roomSpacing;
                    newY = baseRoom.y + Phaser.Math.Between(-Math.floor(baseRoom.height / 3), Math.floor(baseRoom.height / 3));
                    break;
                case 'down':
                    newX = baseRoom.x + Phaser.Math.Between(-Math.floor(baseRoom.width / 3), Math.floor(baseRoom.width / 3));
                    newY = baseRoom.y + baseRoom.height + roomSpacing;
                    break;
                case 'up':
                    newX = baseRoom.x + Phaser.Math.Between(-Math.floor(baseRoom.width / 3), Math.floor(baseRoom.width / 3));
                    newY = baseRoom.y - newRoom.height - roomSpacing;
                    break;
            }

            newRoom.x = newX;
            newRoom.y = newY;
            newRoom.depth = baseRoom.depth + 1;

            if (!overlapsAny(rooms, newRoom.x, newRoom.y, newRoom.width, newRoom.height, 3)) {
                rooms.push(newRoom);
                roomCount++;

                fillRoom(mapTiles, roomTiles, newRoom);

                createConnection(baseRoom, newRoom, dir);

                connectRooms(mapTiles, roomTiles, baseRoom, newRoom, dir);

                expansionQueue.push(newRoom);

                if (getConnectionCount(baseRoom) >= 3) {
                    break;
                }
            }
        }

        if (getConnectionCount(baseRoom) < 3) {
            expansionQueue.push(baseRoom);
        }
    }
}

function connectAllRooms(rooms, mapTiles, roomTiles) {
    const connected = new Set();
    const unconnected = new Set(rooms);

    const startRoom = rooms.find(r => r.isStart);
    if (!startRoom) return;

    connected.add(startRoom);
    unconnected.delete(startRoom);

    while (unconnected.size > 0) {
        let closestRoom = null;
        let closestConnectedRoom = null;
        let minDistance = Infinity;

        for (const room of unconnected) {
            for (const connectedRoom of connected) {
                const distance = Math.abs(room.x - connectedRoom.x) + Math.abs(room.y - connectedRoom.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestRoom = room;
                    closestConnectedRoom = connectedRoom;
                }
            }
        }

        if (closestRoom && closestConnectedRoom) {
            let dir;
            if (Math.abs(closestRoom.x - closestConnectedRoom.x) > Math.abs(closestRoom.y - closestConnectedRoom.y)) {
                dir = closestRoom.x > closestConnectedRoom.x ? 'right' : 'left';
            } else {
                dir = closestRoom.y > closestConnectedRoom.y ? 'down' : 'up';
            }

            createConnection(closestConnectedRoom, closestRoom, dir);
            connectRooms(mapTiles, roomTiles, closestConnectedRoom, closestRoom, dir);

            connected.add(closestRoom);
            unconnected.delete(closestRoom);
        } else {
            break;
        }
    }
}

function createConnection(roomA, roomB, direction) {
    if (!roomA.connections) roomA.connections = [];
    if (!roomB.connections) roomB.connections = [];

    roomA.connections.push({
        room: roomB,
        direction: direction
    });

    roomB.connections.push({
        room: roomA,
        direction: getOppositeDirection(direction)
    });
}

function connectRooms(map, roomTiles, roomA, roomB, dir) {
    const corridorWidth = 3;

    const centerA = {
        x: roomA.x + Math.floor(roomA.width / 2),
        y: roomA.y + Math.floor(roomA.height / 2)
    };

    const centerB = {
        x: roomB.x + Math.floor(roomB.width / 2),
        y: roomB.y + Math.floor(roomB.height / 2)
    };

    switch (dir) {
        case 'right':
        case 'left':
            createHorizontalCorridor(map, roomTiles, roomA, roomB, centerA, centerB, corridorWidth, dir);
            break;
        case 'down':
        case 'up':
            createVerticalCorridor(map, roomTiles, roomA, roomB, centerA, centerB, corridorWidth, dir);
            break;
    }
}

function createHorizontalCorridor(map, roomTiles, leftRoom, rightRoom, centerA, centerB, width, dir) {
    const leftRoomObj = dir === 'right' ? leftRoom : rightRoom;
    const rightRoomObj = dir === 'right' ? rightRoom : leftRoom;

    const leftCenter = dir === 'right' ? centerA : centerB;
    const rightCenter = dir === 'right' ? centerB : centerA;

    const leftDoorY = leftCenter.y;
    const rightDoorY = rightCenter.y;

    for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
        const doorKey = `${leftRoomObj.x + leftRoomObj.width - 1},${leftDoorY + dy}`;
        map[doorKey] = 'D';
        if (roomTiles[doorKey]) {
            roomTiles[doorKey].isConnection = true;
        }
    }

    for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
        const doorKey = `${rightRoomObj.x},${rightDoorY + dy}`;
        map[doorKey] = 'D';
        if (roomTiles[doorKey]) {
            roomTiles[doorKey].isConnection = true;
        }
    }

    const startX = leftRoomObj.x + leftRoomObj.width;
    const endX = rightRoomObj.x - 1;

    if (leftDoorY !== rightDoorY) {
        const turnX = startX + Math.floor((endX - startX) / 2);

        for (let x = startX; x <= turnX; x++) {
            for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
                const corridorKey = `${x},${leftDoorY + dy}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'horizontal'
                };
            }
        }

        const startY = Math.min(leftDoorY, rightDoorY);
        const endY = Math.max(leftDoorY, rightDoorY);

        for (let y = startY; y <= endY; y++) {
            for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
                const corridorKey = `${turnX + dx},${y}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'vertical'
                };
            }
        }

        for (let x = turnX + 1; x <= endX; x++) {
            for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
                const corridorKey = `${x},${rightDoorY + dy}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'horizontal'
                };
            }
        }
    } else {
        for (let x = startX; x <= endX; x++) {
            for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
                const corridorKey = `${x},${leftDoorY + dy}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'horizontal'
                };
            }
        }
    }
}

function createVerticalCorridor(map, roomTiles, topRoom, bottomRoom, centerA, centerB, width, dir) {
    const topRoomObj = dir === 'down' ? topRoom : bottomRoom;
    const bottomRoomObj = dir === 'down' ? bottomRoom : topRoom;

    const topCenter = dir === 'down' ? centerA : centerB;
    const bottomCenter = dir === 'down' ? centerB : centerA;

    const topDoorX = topCenter.x;
    const bottomDoorX = bottomCenter.x;

    for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        const doorKey = `${topDoorX + dx},${topRoomObj.y + topRoomObj.height - 1}`;
        map[doorKey] = 'D';
        if (roomTiles[doorKey]) {
            roomTiles[doorKey].isConnection = true;
        }
    }

    for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        const doorKey = `${bottomDoorX + dx},${bottomRoomObj.y}`;
        map[doorKey] = 'D';
        if (roomTiles[doorKey]) {
            roomTiles[doorKey].isConnection = true;
        }
    }

    const startY = topRoomObj.y + topRoomObj.height;
    const endY = bottomRoomObj.y - 1;

    if (topDoorX !== bottomDoorX) {
        const turnY = startY + Math.floor((endY - startY) / 2);

        for (let y = startY; y <= turnY; y++) {
            for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
                const corridorKey = `${topDoorX + dx},${y}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'vertical'
                };
            }
        }

        const startX = Math.min(topDoorX, bottomDoorX);
        const endX = Math.max(topDoorX, bottomDoorX);

        for (let x = startX; x <= endX; x++) {
            for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
                const corridorKey = `${x},${turnY + dy}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'horizontal'
                };
            }
        }

        for (let y = turnY + 1; y <= endY; y++) {
            for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
                const corridorKey = `${bottomDoorX + dx},${y}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'vertical'
                };
            }
        }
    } else {
        for (let y = startY; y <= endY; y++) {
            for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
                const corridorKey = `${topDoorX + dx},${y}`;
                map[corridorKey] = 'C';
                roomTiles[corridorKey] = {
                    isCorridor: true,
                    type: 'corridor',
                    corridorDirection: 'vertical'
                };
            }
        }
    }
}

function placeSpecialRooms(scene, rooms, mapTiles, roomTiles) {
    const edgeRooms = findEdgeRooms(rooms);
    placeTreasureRoom(edgeRooms);
    placeBossRoom(rooms, edgeRooms);
    placeSecretRooms(scene, rooms, mapTiles, roomTiles);
}

function findEdgeRooms(rooms) {
    return rooms.filter(room =>
        (room.type === 'normal' || room.type === 'hall' || room.type === 'square') &&
        getConnectionCount(room) <= 2 &&
        room.depth >= 3
    ).sort((a, b) => getConnectionCount(a) - getConnectionCount(b));
}

function placeTreasureRoom(edgeRooms) {
    const treasureCandidates = edgeRooms.filter(room => getConnectionCount(room) === 1);
    if (treasureCandidates.length > 0) {
        const treasureRoom = Phaser.Utils.Array.GetRandom(treasureCandidates);
        treasureRoom.type = 'treasure';
        if (treasureRoom.connections.length > 1) {
            treasureRoom.connections = [treasureRoom.connections[0]];
        }
    }
}

function placeBossRoom(rooms, edgeRooms) {
    const bossCandidates = edgeRooms.filter(room =>
        room.type !== 'treasure' &&
        getConnectionCount(room) <= 2
    );

    if (bossCandidates.length > 0) {
        const startRoom = rooms.find(r => r.isStart);
        const farthestRoom = bossCandidates.reduce((farthest, room) => {
            const dist = Math.abs(room.x - startRoom.x) + Math.abs(room.y - startRoom.y);
            const farthestDist = Math.abs(farthest.x - startRoom.x) + Math.abs(farthest.y - startRoom.y);
            return dist > farthestDist ? room : farthest;
        }, bossCandidates[0]);

        farthestRoom.type = 'boss';
        if (farthestRoom.connections.length > 2) {
            farthestRoom.connections = farthestRoom.connections.slice(0, 2);
        }
    }
}

function placeSecretRooms(scene, rooms, mapTiles, roomTiles) {
    const hubRooms = rooms.filter(room =>
        getConnectionCount(room) >= 3 &&
        room.type !== 'boss' &&
        room.type !== 'treasure'
    );

    const secretCount = Phaser.Math.Between(1, 2);
    for (let i = 0; i < secretCount && hubRooms.length > 0; i++) {
        const hub = Phaser.Utils.Array.GetRandom(hubRooms);
        const secretRoom = generateSpecialRoom(scene, 0, 0, 'secret');

        const directions = ['right', 'left', 'up', 'down'];
        const availableDirs = directions.filter(dir =>
            !hub.connections.some(conn => conn.direction === dir)
        );

        if (availableDirs.length > 0) {
            const dir = Phaser.Utils.Array.GetRandom(availableDirs);
            const corridorLength = Phaser.Math.Between(8, 12);

            let x, y;
            switch (dir) {
                case 'right':
                    x = hub.x + hub.width + corridorLength;
                    y = hub.y + Phaser.Math.Between(-Math.floor(hub.height / 3), Math.floor(hub.height / 3));
                    break;
                case 'left':
                    x = hub.x - secretRoom.width - corridorLength;
                    y = hub.y + Phaser.Math.Between(-Math.floor(hub.height / 3), Math.floor(hub.height / 3));
                    break;
                case 'up':
                    x = hub.x + Phaser.Math.Between(-Math.floor(hub.width / 3), Math.floor(hub.width / 3));
                    y = hub.y - secretRoom.height - corridorLength;
                    break;
                case 'down':
                    x = hub.x + Phaser.Math.Between(-Math.floor(hub.width / 3), Math.floor(hub.width / 3));
                    y = hub.y + hub.height + corridorLength;
                    break;
            }

            if (!overlapsAny(rooms, x, y, secretRoom.width, secretRoom.height, 4)) {
                secretRoom.x = x;
                secretRoom.y = y;
                secretRoom.isSecret = true;
                rooms.push(secretRoom);

                fillRoom(mapTiles, roomTiles, secretRoom);
                connectRooms(mapTiles, roomTiles, hub, secretRoom, dir);

                createConnection(hub, secretRoom, dir);
            }
        }
    }
}

function fillRoom(map, roomTiles, room) {
    const roomId = `${room.x},${room.y}-${room.width}x${room.height}`;

    for (let i = 0; i < room.width; i++) {
        for (let j = 0; j < room.height; j++) {
            const x = room.x + i;
            const y = room.y + j;
            const isWall = i === 0 || j === 0 || i === room.width - 1 || j === room.height - 1;
            const isCorner = (i === 0 && j === 0) || (i === 0 && j === room.height - 1) ||
                (i === room.width - 1 && j === 0) || (i === room.width - 1 && j === room.height - 1);

            map[`${x},${y}`] = isWall ? '#' : '.';

            roomTiles[`${x},${y}`] = {
                roomId: roomId,
                isWall: isWall,
                isRoom: true,
                isCorner: isCorner,
            };
        }
    }
}

function getConnectionCount(room) {
    return room.connections ? room.connections.length : 0;
}

function getOppositeDirection(dir) {
    switch (dir) {
        case 'right': return 'left';
        case 'left': return 'right';
        case 'up': return 'down';
        case 'down': return 'up';
    }
}

function overlapsAny(rooms, x, y, w, h, gap = 1) {
    for (const r of rooms) {
        if (
            x - gap < r.x + r.width &&
            x + w + gap > r.x &&
            y - gap < r.y + r.height &&
            y + h + gap > r.y
        ) return true;
    }
    return false;
}