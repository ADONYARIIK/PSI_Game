export const RoomTemplates = {
    start: {
        chance: 0,
        size: [9, 9],
    },
    normal: {
        chance: 30,
        size: [10, 14],
    },
    hall: {
        chance: 15,
        size: [14, 18],
    },
    corridor_room: {
        chance: 10,
        size: [6, 20],
        horizontal: { width: [20, 24], height: [6, 8] },
        vertical: { width: [6, 8], height: [20, 24] },
    },
    square: {
        chance: 12,
        size: [10, 10],
    },
    obstacle_course: {
        chance: 8,
        size: [12, 12],
    },
    crossroads: {
        chance: 5,
        size: [9, 9],
        treasure: {
            chance: 5,
            size: [10, 12],
        }
    },
    boss: {
        chance: 5,
        size: [14, 16],
    },
    secret: {
        chance: 5,
        size: [8, 8],
    },
    trap_room: {
        chance: 5,
        size: [10, 10],
    }
};