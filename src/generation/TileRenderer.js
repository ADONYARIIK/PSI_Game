import { TILE_SIZE, TEXTURES, FRAME_CONFIG } from "../entities/consts";
import { frameName } from "../entities/consts";

const atlas = FRAME_CONFIG.atlasKey;

export function drawTiles(scene, mapTiles, roomTiles) {
    drawAbyss(scene, mapTiles);
    drawAllFloors(scene, mapTiles);
    drawAllWalls(scene, mapTiles, roomTiles);
}

function drawAllFloors(scene, mapTiles) {
    for (const [key, value] of Object.entries(mapTiles)) {
        const [x, y] = key.split(',').map(Number);
        const wx = x * TILE_SIZE;
        const wy = y * TILE_SIZE;

        if (value === '.' || value === 'D' || value === 'C') {
            const textures = getTextures();
            const floorFrame = Phaser.Utils.Array.GetRandom(textures.floor);
            scene.add.image(wx, wy, atlas, frameName(`${floorFrame}`))
                .setOrigin(0)
                .setDepth(1);
        }
    }
}

function drawAllWalls(scene, mapTiles, roomTiles) {
    const wallData = [];

    for (const [key, value] of Object.entries(mapTiles)) {
        if (value === '#') {
            const [x, y] = key.split(',').map(Number);
            const wx = x * TILE_SIZE;
            const wy = y * TILE_SIZE;

            wallData.push({ x, y, wx, wy, roomInfo: roomTiles[key] });
        }
    }

    for (const wall of wallData) {
        if (wall.roomInfo && wall.roomInfo.isRoom) {
            drawRoomWall(scene, mapTiles, wall.x, wall.y, wall.wx, wall.wy);
        }
    }

    for (const wall of wallData) {
        if (!wall.roomInfo || !wall.roomInfo.isRoom) {
            drawCorridorWall(scene, mapTiles, wall.x, wall.y, wall.wx, wall.wy);
        }
    }
}

function drawRoomWall(scene, mapTiles, x, y, wx, wy) {
    const textures = getTextures();

    const up = mapTiles[`${x},${y - 1}`];
    const down = mapTiles[`${x},${y + 1}`];
    const left = mapTiles[`${x - 1},${y}`];
    const right = mapTiles[`${x + 1},${y}`];

    const hasUp = up === '.';
    const hasDown = down === '.';
    const hasLeft = left === '.';
    const hasRight = right === '.';

    const upWall = up === '#';
    const downWall = down === '#';
    const leftWall = left === '#';
    const rightWall = right === '#';

    const upCorridor = up === 'C' || up === 'D';
    const downCorridor = down === 'C' || down === 'D';
    const leftCorridor = left === 'C' || left === 'D';
    const rightCorridor = right === 'C' || right === 'D';

    let wallPosition = 'default';

    if (hasUp && rightCorridor) {
        wallPosition = 'inside-corner-right';
    }
    else if (hasUp && leftCorridor) {
        wallPosition = 'inside-corner-left';
    }
    else if (hasLeft && downCorridor) {
        wallPosition = 'top';
    }
    else if (hasLeft && upCorridor) {
        wallPosition = 'inside-corner-left';
    }
    else if (hasRight && downCorridor) {
        wallPosition = 'top';
    }
    else if (hasRight && upCorridor) {
        wallPosition = 'inside-corner-right';
    }
    else if (upCorridor && leftWall && rightWall) {
        wallPosition = 'bottom';
    }
    else if (hasDown) {
        wallPosition = 'top';
    }
    else if (hasUp) {
        wallPosition = 'bottom';
    }
    else if (hasRight) {
        wallPosition = 'left';
    }
    else if (hasLeft) {
        wallPosition = 'right';
    }
    else if (downWall && rightWall) {
        wallPosition = 'top-left';
    }
    else if (downWall && leftWall) {
        wallPosition = 'top-right';
    }
    else if (upWall && rightWall) {
        wallPosition = 'bottom-left';
    }
    else if (upWall && leftWall) {
        wallPosition = 'bottom-right';
    }

    drawWallByPosition(scene, wx, wy, wallPosition, textures);
}

function drawCorridorWall(scene, mapTiles, x, y, wx, wy) {
    const textures = getTextures();

    const up = mapTiles[`${x},${y - 1}`];
    const down = mapTiles[`${x},${y + 1}`];
    const left = mapTiles[`${x - 1},${y}`];
    const right = mapTiles[`${x + 1},${y}`];

    const hasUp = up === '.' || up === 'C' || up === 'D';
    const hasDown = down === '.' || down === 'C' || down === 'D';
    const hasLeft = left === '.' || left === 'C' || left === 'D';
    const hasRight = right === '.' || right === 'C' || right === 'D';

    const upWall = up === '#';
    const downWall = down === '#';
    const leftWall = left === '#';
    const rightWall = right === '#';

    let wallPosition = 'default';

    if (hasUp && hasLeft && rightWall && downWall) {
        wallPosition = 'inside-corner-left'
    }
    else if (hasUp && hasRight && leftWall && downWall) {
        wallPosition = 'inside-corner-right'
    }
    else if (hasLeft && !hasRight && upWall && downWall) {
        wallPosition = 'right';
    }
    else if (hasDown && !hasUp) {
        wallPosition = 'top';
    }
    else if (hasUp && !hasDown) {
        wallPosition = 'bottom';
    }
    else if (hasRight && !hasLeft) {
        wallPosition = 'left';
    }
    else if (hasLeft && !hasRight) {
        wallPosition = 'right';
    }
    else if (downWall && hasRight) {
        wallPosition = 'top-left';
    }
    else if (downWall && hasLeft) {
        wallPosition = 'top-right';
    }
    else if (upWall && rightWall) {
        wallPosition = 'bottom-left';
    }
    else if (upWall && leftWall) {
        wallPosition = 'bottom-right';
    }
    else if (leftWall && downWall) {
        wallPosition = 'right';
    }

    drawWallByPosition(scene, wx, wy, wallPosition, textures);
}

function drawWallByPosition(scene, wx, wy, position, textures) {
    switch (position) {
        case 'top':
            addWall(scene, wx, wy, textures.wallTop);
            break;
        case 'bottom':
            addWall(scene, wx, wy, textures.wallBottom);
            break;
        case 'left':
            addWall(scene, wx, wy, textures.wallVertical, false);
            break;
        case 'right':
            addWall(scene, wx, wy, textures.wallVertical, true);
            break;
        case 'top-left':
            addWall(scene, wx, wy, textures.wallVertical, false);
            break;
        case 'top-right':
            addWall(scene, wx, wy, textures.wallVertical, true);
            break;
        case 'bottom-left':
            addWall(scene, wx, wy, textures.wallBottomCorner, false);
            break;
        case 'bottom-right':
            addWall(scene, wx, wy, textures.wallBottomCorner, true);
            break;
        case 'inside-corner-left':
            addWall(scene, wx, wy, textures.wallCorner, false);
            break;
        case 'inside-corner-right':
            addWall(scene, wx, wy, textures.wallCorner, true);
            break;

        default:
            addWall(scene, wx, wy, textures.wallVertical, false);
    }
}

function drawAbyss(scene, mapTiles) {
    const abyssFrame = TEXTURES.abyss;
    const keys = Object.keys(mapTiles);
    const coords = keys.map(k => k.split(',').map(Number));

    let minX = Math.min(...coords.map(c => c[0])) - 6;
    let maxX = Math.max(...coords.map(c => c[0])) + 6;
    let minY = Math.min(...coords.map(c => c[1])) - 6;
    let maxY = Math.max(...coords.map(c => c[1])) + 6;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (!mapTiles[`${x},${y}`]) {
                scene.add.image(
                    x * TILE_SIZE,
                    y * TILE_SIZE,
                    atlas,
                    frameName(`${abyssFrame}`)
                ).setOrigin(0).setDepth(0);
            }
        }
    }
}

function addWall(scene, wx, wy, textureList, flipX = false) {
    const frame = Phaser.Utils.Array.GetRandom(textureList);

    const img = scene.add.image(wx, wy, atlas, frameName(`${frame}`));
    img.setOrigin(0)
        .setDepth(3);

    if (flipX) img.flipX = true;
}

function getTextures() {
    const baseTextures = {
        floor: TEXTURES.floor,
        wallTop: TEXTURES.wallTop,
        wallBottom: TEXTURES.wallBottom,
        wallVertical: TEXTURES.wallVertical,
        wallCorner: TEXTURES.wallCorner,
        wallBottomCorner: TEXTURES.wallBottomCorner
    };

    return baseTextures;
}