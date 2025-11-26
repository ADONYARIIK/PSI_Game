import { createDecor } from '../utils/createHelper.js';
import { TILE_SIZE } from '../entities/consts.js';

export class MapDecorator {
    constructor(scene, mapTiles, roomTiles, rooms) {
        this.scene = scene;
        this.mapTiles = mapTiles;
        this.roomTiles = roomTiles;
        this.rooms = rooms;
        this.density = 0.03;

        this.DEPTH = {
            FLOOR_DECOR: 4,
            WALL_DECOR: 100
        };
    }

    placeAllDecor() {
        this.placeRoomDecor();
        this.placeCorridorDecor(this.density * 4);
    }


    placeRoomDecor() {
        for (const room of this.rooms) {
            this.placeDecorForRoom(room);
        }
    }

    placeDecorForRoom(room) {
        const bounds = {
            x: room.x,
            y: room.y,
            width: room.width,
            height: room.height
        };

        switch (room.type) {
            case 'start':
                this.placeStartRoomDecor(bounds);
                break;
            case 'treasure':
                this.placeTreasureRoomDecor(bounds);
                break;
            case 'boss':
                this.placeBossRoomDecor(bounds);
                break;
            case 'secret':
                this.placeSecretRoomDecor(bounds);
                break;
            case 'crossroads':
                this.placeCrossroadsDecor(bounds);
                break;
            default:
                this.placeNormalRoomDecor(bounds);
        }
    }

    placeStartRoomDecor(bounds) {
        this.placeTopWallDecor(bounds);
        this.placeSideWallTorches(bounds);
        this.placeRandomFloorDecor(bounds, this.density * 5);
    }

    placeNormalRoomDecor(bounds) {
        this.placeTopWallDecor(bounds);
        this.placeSideWallTorches(bounds);
        this.placeRandomFloorDecor(bounds, this.density * 4);
    }

    placeTreasureRoomDecor(bounds) {
        this.placeTopWallDecor(bounds);
        this.placeChest(bounds.x + Math.floor(bounds.width / 2), bounds.y + Math.floor(bounds.height / 2));
        this.placeRandomFloorDecor(bounds, this.density * 2);
    }

    placeBossRoomDecor(bounds) {
        this.placeTopWallTorches(bounds, 3);
        this.placeSideWallTorches(bounds, 3);
        this.placeRandomFloorDecor(bounds, this.density * 8);

        this.placeBossRoomSpecialDecor(bounds);
    }

    placeSecretRoomDecor(bounds) {
        this.placeTopWallTorches(bounds, 1);
        this.placeSideWallTorches(bounds, 1);
        this.placeRandomFloorDecor(bounds, this.density * 4);
    }

    placeCrossroadsDecor(bounds) {
        this.placeTopWallTorches(bounds);
        this.placeSideWallTorches(bounds);
        this.placeRandomFloorDecor(bounds, this.density * 3);
    }

    placeBossRoomSpecialDecor(bounds) {
        const corners = [
            { x: bounds.x + 2, y: bounds.y + 2 },
            { x: bounds.x + bounds.width - 3, y: bounds.y + 2 },
            { x: bounds.x + 2, y: bounds.y + bounds.height - 3 },
            { x: bounds.x + bounds.width - 3, y: bounds.y + bounds.height - 3 }
        ];

        corners.forEach(corner => {
            if (this.isValidFloorPosition(corner.x, corner.y)) {
                this.placeFloorDecor(corner.x, corner.y, 'bones');
            }
        });

        const centerX = bounds.x + Math.floor(bounds.width / 2);
        const centerY = bounds.y + Math.floor(bounds.height / 2);

        const candlePositions = [
            { x: centerX - 2, y: centerY - 2 },
            { x: centerX + 2, y: centerY - 2 },
            { x: centerX - 2, y: centerY + 2 },
            { x: centerX + 2, y: centerY + 2 }
        ];

        candlePositions.forEach(pos => {
            if (this.isValidFloorPosition(pos.x, pos.y)) {
                this.placeCandle(pos.x, pos.y);
            }
        });
    }


    placeTopWallDecor(bounds, specificCount = null) {
        let decorCount = specificCount;
        if (decorCount === null) {
            if (bounds.width < 8) decorCount = 1;
            else if (bounds.width < 12) decorCount = 2;
            else decorCount = 3;
        }

        const step = Math.floor(bounds.width / (decorCount + 1));

        for (let i = 1; i <= decorCount; i++) {
            const decorX = bounds.x + i * step;
            const decorY = bounds.y;

            if (this.isValidWallPosition(decorX, decorY)) {
                if (i % 2 === 1) {
                    this.placeTorch(decorX, decorY, 'top');
                } else {
                    this.placeFlag(decorX, decorY);
                }
            }
        }
    }

    placeTopWallTorches(bounds, specificCount = null) {
        let torchCount = specificCount;
        if (torchCount === null) {
            if (bounds.width < 5) torchCount = 1;
            else if (bounds.width < 10) torchCount = 2;
            else if (bounds.width < 15) torchCount = 3;
            else torchCount = 4;
        }

        const step = Math.floor(bounds.width / (torchCount + 1));

        for (let i = 1; i <= torchCount; i++) {
            const torchX = bounds.x + i * step;
            const torchY = bounds.y;

            if (this.isValidWallPosition(torchX, torchY)) {
                this.placeTorch(torchX, torchY, 'top');
            }
        }
    }

    placeSideWallTorches(bounds, specificCount = null) {
        let torchCount = specificCount;
        if (torchCount === null) {
            if (bounds.height < 5) torchCount = 1;
            else if (bounds.height < 10) torchCount = 2;
            else if (bounds.height < 15) torchCount = 3;
            else torchCount = 4;
        }

        const step = Math.floor(bounds.height / (torchCount + 1));

        for (let i = 1; i <= torchCount; i++) {
            const torchY = bounds.y + i * step;

            if (this.isValidWallPosition(bounds.x, torchY)) {
                this.placeSideTorch(bounds.x + 1, torchY, 'left');
            }

            if (this.isValidWallPosition(bounds.x + bounds.width - 1, torchY)) {
                this.placeSideTorch(bounds.x - 1 + bounds.width - 1, torchY, 'right');
            }
        }
    }

    placeFlags(bounds) {
        const flagCount = Math.min(1, Math.floor(bounds.width / 4));

        for (let i = 1; i <= flagCount; i++) {
            const flagX = bounds.x + Math.floor(bounds.width / (flagCount + 1)) * i;
            const flagY = bounds.y;

            if (this.isValidWallPosition(flagX, flagY)) {
                this.placeFlag(flagX, flagY);
            }
        }
    }

    placeRandomFloorDecor(bounds, density) {
        for (let x = bounds.x + 1; x < bounds.x + bounds.width - 1; x++) {
            for (let y = bounds.y + 1; y < bounds.y + bounds.height - 1; y++) {
                const tileKey = `${x},${y}`;
                if (this.mapTiles[tileKey] === '.' && Math.random() < density) {
                    const decorType = Phaser.Math.RND.weightedPick([
                        { key: 'bones', weight: 4 },
                        { key: 'rocks', weight: 3 },
                        { key: 'web', weight: 2 }
                    ]);

                    if (decorType.key === 'web') {
                        if (!this.isNearWall(x, y)) {
                            continue;
                        }
                    }

                    this.placeFloorDecor(x, y, decorType.key);
                }
            }
        }
    }

    placeCorridorDecor(density) {
        for (const [key, tileInfo] of Object.entries(this.roomTiles)) {
            if (tileInfo.isCorridor && !tileInfo.isConnection) {
                const [x, y] = key.split(',').map(Number);

                if (this.mapTiles[key] === 'C' && Math.random() < density) {
                    const decorType = Phaser.Math.RND.weightedPick([
                        { key: 'bones', weight: 3 },
                        { key: 'rocks', weight: 2 },
                        { key: 'web', weight: 1 }
                    ]);

                    if (decorType.key === 'web') {
                        if (!this.isNearWall(x, y)) {
                            continue;
                        }
                    }

                    this.placeFloorDecor(x, y, decorType.key);
                }
            }
        }
    }


    placeTorch(x, y, position) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        if (position === 'top') {
            createDecor(this.scene, worldX, worldY, {
                animation: true
            }, 'torch', this.DEPTH.WALL_DECOR);
        }
    }

    placeSideTorch(x, y, side) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        if (side === 'left') {
            createDecor(this.scene, worldX, worldY, {
                animation: true,
                flipX: false
            }, 'sideTorch', this.DEPTH.WALL_DECOR);
        } else if (side === 'right') {
            createDecor(this.scene, worldX, worldY, {
                animation: true,
                flipX: true
            }, 'sideTorch', this.DEPTH.WALL_DECOR);
        }
    }

    placeFlag(x, y) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        createDecor(this.scene, worldX, worldY, {
            animation: true
        }, 'flag', this.DEPTH.WALL_DECOR);
    }

    placeChest(x, y) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        createDecor(this.scene, worldX, worldY, {}, 'chest', this.DEPTH.CHEST);
    }

    placeFloorDecor(x, y, type) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        const flipX = Math.random() < 0.5;

        createDecor(this.scene, worldX, worldY, { flipX }, type, this.DEPTH.FLOOR_DECOR);
    }

    placeCandle(x, y) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;

        createDecor(this.scene, worldX, worldY, {
            animation: true
        }, 'candlestick1', this.DEPTH.FLOOR_DECOR + 1);
    }


    isValidWallPosition(x, y) {
        const tileKey = `${x},${y}`;

        if (this.mapTiles[tileKey] !== '#') {
            return false;
        }

        const roomInfo = this.roomTiles[tileKey];
        if (roomInfo && roomInfo.isCorner) {
            return false;
        }

        const neighbors = [
            `${x},${y - 1}`,
            `${x},${y + 1}`,
            `${x - 1},${y}`,
            `${x + 1},${y}`
        ];

        for (const neighborKey of neighbors) {
            if (this.mapTiles[neighborKey] === 'D') {
                return false;
            }
        }

        return true;
    }

    isNearWall(x, y) {
        const neighbors = [
            `${x - 1},${y}`,
            `${x + 1},${y}`,
            `${x},${y - 1}`,
            `${x},${y + 1}`
        ];

        for (const neighborKey of neighbors) {
            if (this.mapTiles[neighborKey] === '#') {
                return true;
            }
        }
        return false;
    }

    isValidFloorPosition(x, y) {
        const tileKey = `${x},${y}`;
        return this.mapTiles[tileKey] === '.' &&
            !this.isNearDoor(x, y);
    }

    isNearDoor(x, y) {
        const neighbors = [
            `${x - 1},${y}`, `${x + 1},${y}`,
            `${x},${y - 1}`, `${x},${y + 1}`
        ];

        return neighbors.some(neighbor =>
            this.mapTiles[neighbor] === 'D' || this.mapTiles[neighbor] === 'E'
        );
    }
}