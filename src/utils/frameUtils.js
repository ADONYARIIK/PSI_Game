// import { frameName } from '../entities/consts.js';

export function frameSequenceFor(direction, mode = 'idle') {
    const dir = direction.name;

    if (mode === 'eat') {
        const arr = [];
        for (let i = 1; i <= 8; i++) {
            arr.push(`snake_head${dir}Eat_${String(i).padStart(2, '0')}`);
        }
        return arr;
    } else if (mode === 'shock') {
        const arr = [];
        for (let i = 1; i <= 7; i++) {
            arr.push(`snake_head${dir}Shock_${String(i).padStart(2, '0')}`);
        }
        return arr;
    } else {
        return [`snake_head${dir}`];
    }
}