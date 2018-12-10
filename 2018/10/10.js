const path = require('path');
const os = require('os');

const input = require('../_common/input');
const { setupFromArgv, result, info, debug } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');
const inputRegex = /[\d-]+/g;

function createPoint(x, y, velX, velY) {
    return { x, y, velX, velY };
}

function parsePoint(line) {
    const [x, y, velX, velY] = line.match(inputRegex);

    return createPoint(+x, +y, +velX, +velY);
}

function parsePoints(sky, lines) {
    lines.forEach((line) => {
        const point = parsePoint(line);
        sky.points.push(point);
    });
}

function readPoints() {
    const sky = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, points: [], time: -1 };

    return input.readLines(inputFilePath, parsePoints.bind(null, sky))
        .then(() => sky);
}

function drawSky(sky) {
    info('Y:', sky.maxY - sky.minY, 'X:', sky.maxX - sky.minY, 'time:', sky.time);

    const rows = sky.points.reduce((rows, point) => {
        const row = rows.get(point.y) || new Set();
        row.add(point.x);
        rows.set(point.y, row);
        return rows;
    }, new Map());

    for (let i = sky.minY; i <= sky.maxY; i++) {
        for (let j = sky.minX; j <= sky.maxX; j++) {
            const row = rows.get(i);
            process.stdout.write(row && row.has(j) ? '#' : ' ');
        }
        process.stdout.write(os.EOL);
    }
}

function setSecond(sky, second) {
    sky.time = second;
    sky.points.forEach((point) => {
        point.x = point.x + point.velX * sky.time;
        point.y = point.y + point.velY * sky.time;

        sky.minX = Math.min(sky.minX, point.x);
        sky.maxX = Math.max(sky.maxX, point.x);
        sky.minY = Math.min(sky.minY, point.y);
        sky.maxY = Math.max(sky.maxY, point.y);
    });
}

function runTime(sky) {
    let time = -1;
    let minHeight = Infinity;
    let currentHeight = Infinity;

    do {
        minHeight = currentHeight;
        time += 1;
        let minY = Infinity;
        let maxY = -Infinity;
        sky.points.forEach((point) => {
            const y = point.y + point.velY * time;
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        currentHeight = maxY - minY;
        debug('Time =', time, 'Height =', currentHeight);
    } while (currentHeight < minHeight)

    time -= 1;
    info('Min height at', time, 'second', 'is', minHeight);
    setSecond(sky, time);
    drawSky(sky);

    return sky;
}

function speedUp() {
    return readPoints().then((sky) => {
        result('[10.1]', runTime(sky).time, 10511);
    });
}

speedUp();
