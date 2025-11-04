import { createSnake, createDecor } from './createHelper.js';

export function loadTiledObjects(scene, map) {
    const objectsLayer = map.getObjectLayer('Objects')?.objects || [];
    const objects = { enemies: [] };

    objectsLayer.forEach(obj => {
        const props = (obj.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        if (obj.type === 'player' && obj.name === 'snake') {
            objects.snake = createSnake(scene, obj.x, obj.y, props.direction || 'Right');
        } else if (obj.type === 'decor') {
            objects[obj.name] = createDecor(scene, obj.x, obj.y, props, obj.name);
        }
    });

    return objects;
}