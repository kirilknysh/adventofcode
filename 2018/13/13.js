const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseLines(state, lines) {
    lines.forEach((line) => {
        state.map.push(line.split(''));
    });
}

function readInput() {
    const state = { map: [], carts: [], cartPositions: new Set() };

    return input.readLines(inputFilePath, parseLines.bind(null, state))
        .then(() => state);
}

function createCart(x, y, direction) {
    return { x, y, direction, intersections: 0 };
}

function normalizeMap(state) {
    state.map.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === '^' || value === 'v') {
                state.carts.push(createCart(colIndex, rowIndex, value));
                state.cartPositions.add(`${colIndex},${rowIndex}`);
                state.map[rowIndex][colIndex] = '|';
            } else if (value === '<' || value === '>') {
                state.carts.push(createCart(colIndex, rowIndex, value));
                state.cartPositions.add(`${colIndex},${rowIndex}`);
                state.map[rowIndex][colIndex] = '-';
            }
        });
    });
}

function sortCarts(state) {
    state.carts.sort((left, right) => {
        if (left.y !== right.y) {
            return left.y - right.y
        }
        return left.x - right.x;
    });
}

const movementMap = {
    '>': {
        '\\': 'v',
        '/': '^',
        intersection: ['^', '>', 'v'],
    },
    '<': {
        '\\': '^',
        '/': 'v',
        intersection: ['v', '<', '^'],
    },
    '^': {
        ['\\']: '<',
        '/': '>',
        intersection: ['<', '^', '>'],
    },
    'v': {
        '\\': '>',
        '/': '<',
        intersection: ['>', 'v', '<'],
    },
};

function getPosition(x, y) {
    return `${x},${y}`;
}

function move(state, cart, x, y, map) {
    const oldPosition = getPosition(cart.x, cart.y);
    const position = getPosition(x, y);

    if (state.cartPositions.has(position)) {
        return position;
    }

    const cell = state.map[y][x];
    cart.x = x;
    cart.y = y;

    if (cell === '+') {
        cart.direction = map.intersection[cart.intersections % 3];
        cart.intersections += 1;
    } else if (map[cell]) {
        cart.direction = map[cell];
    }

    state.cartPositions.delete(oldPosition);
    state.cartPositions.add(position);
}

function tick(state) {
    for (let cartIndex = 0; cartIndex < state.carts.length; cartIndex++) {
        const cart = state.carts[cartIndex];
        let crash = null;

        if (cart.direction === '>') {
            crash = move(state, cart, cart.x + 1, cart.y, movementMap[cart.direction]);
        } else if (cart.direction === '<') {
            crash = move(state, cart, cart.x - 1, cart.y, movementMap[cart.direction]);
        } else if (cart.direction === '^') {
            crash = move(state, cart, cart.x, cart.y - 1, movementMap[cart.direction]);
        } else if (cart.direction === 'v') {
            crash = move(state, cart, cart.x, cart.y + 1, movementMap[cart.direction]);
        }

        if (crash) {
            if (!state.firstCrash) {
                state.firstCrash = crash;
            }
            state.carts.splice(cartIndex, 1);
            state.cartPositions.delete(getPosition(cart.x, cart.y));

            const crashIndex = state.carts.findIndex((cart) => getPosition(cart.x, cart.y) === crash);
            const shift = 1 + (crashIndex < cartIndex ? 1 : 0);
            state.carts.splice(crashIndex, 1);
            state.cartPositions.delete(crash);

            cartIndex -= shift;
        }
    }

    sortCarts(state);
}

function moveCarts() {
    return readInput().then((state) => {
        normalizeMap(state);

        while(true) {
            tick(state);
            if (state.carts.length === 1) {
                break;
            }
        }

        result('[13.0]', state.firstCrash, '76,108');
        result('[13.1]', `${state.carts[0].x},${state.carts[0].y}`, '2,84');
    });
}

moveCarts();
