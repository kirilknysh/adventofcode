const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const GRID_WIDTH = 300;
const GRID_HEIGHT = 300;
const GRID_SERIAL_NUMBER = 7857;

function calculatePowerLevel(x, y, serial) {
    const rackId = (x + 1) + 10;
    const total = ((rackId * (y + 1)) + serial) * rackId

    return Math.trunc((total % 1000) / 100) - 5;
}

function buildGrid() {
    const grid = new Array(GRID_HEIGHT).fill(null);
    grid.forEach((_, y) => {
        grid[y] = new Array(GRID_WIDTH).fill(0).map((_, x) => {
            return calculatePowerLevel(x, y, GRID_SERIAL_NUMBER);
        });
    });

    return grid;
}

function findSum(grid, x, y) {
    let sum = 0;

    for (let i = y; i < y + 3; i++) {
        for (let j = x; j < x + 3; j++) {
            sum += grid[i][j];
        }
    }
    return sum;
}

function findMaxSubgrid3(grid) {
    const max = { sum: -Infinity, x: 0, y: 0 };

    for (let y = 0; y < grid.length - 3; y++) {
        const row = grid[y];
        for (let x = 0; x < row.length - 3; x++) {
            const sum = findSum(grid, x, y);
            if (max.sum < sum) {
                max.sum = sum;
                max.x = x;
                max.y = y;
            }
        }
    }

    return max;
}

function copyGrid(from, to) {
    from.forEach((row, y) => {
        row.forEach((value, x) => {
            to[y][x] = value;
        });
    });
}

function findMaxSubgrid(grid) {
    const max = { sum: -Infinity, x: 0, y: 0, size: 1 };
    const maxes = new Array(GRID_HEIGHT).fill(null);
    maxes.forEach((_, y) => {
        maxes[y] = new Array(GRID_WIDTH).fill(0);
    });
    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            maxes[y][x] = value;
            if (max.sum < value) {
                max.sum = value;
                max.x = x;
                max.y = y;
            }
        });
    });
    const currentMaxes = new Array(GRID_HEIGHT).fill(null);
    currentMaxes.forEach((_, y) => {
        currentMaxes[y] = new Array(GRID_WIDTH).fill(0);
    });
    for (let y = 0; y < GRID_HEIGHT; y++) {
        currentMaxes[y][0] = grid[y][0];
        currentMaxes[0][y] = grid[0][y];
    }

    for (let side = 2; side <= GRID_HEIGHT; side++) {
        for (let y = side - 1; y < GRID_HEIGHT; y++) {
            for (let x = side - 1; x < GRID_WIDTH; x++) {
                let sum = grid[y][x] + maxes[y - 1][x - 1];
                for (let z = y - side + 1; z < y; z++) {
                    sum += grid[z][x];
                }
                for (let z = x - side + 1; z < x; z++) {
                    sum += grid[y][z];
                }
                currentMaxes[y][x] = sum;
                if (max.sum < sum) {
                    max.sum = sum;
                    max.x = x - side + 1;
                    max.y = y - side + 1;
                    max.size = side;
                }
            }
        }
        copyGrid(currentMaxes, maxes);
    }

    return max;
}

const grid = buildGrid();
const max3 = findMaxSubgrid3(grid);
result('[11.0]', `${max3.x + 1},${max3.y + 1}`, '243,16');
const max = findMaxSubgrid(grid);
result('[11.1]', `${max.x + 1},${max.y + 1},${max.size}`, '231,227,14');
