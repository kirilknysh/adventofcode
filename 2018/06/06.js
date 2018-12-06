const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseCoordinateLine(coordinateLine) {
    const [x, y] = coordinateLine.split(', ');

    return { x: +x, y: +y };
}

function parseCoordinate(coords, meta, lines) {
    lines.forEach((line) => {
        const coord = parseCoordinateLine(line);

        meta.minX = Math.min(meta.minX, coord.x);
        meta.minY = Math.min(meta.minY, coord.y);
        meta.maxX = Math.max(meta.maxX, coord.x);
        meta.maxY = Math.max(meta.maxY, coord.y);

        coords.push(coord);
    });
}

function readCoordinates() {
    const coords = [];
    const meta = { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 };

    return input.readLines(inputFilePath, parseCoordinate.bind(null, coords, meta))
        .then(() => [coords, meta]);
}

function normalizeCoords(coords, meta) {
    coords.forEach((coord) => {
        coord.x -= meta.minX;
        coord.y -= meta.minY;
    });

    meta.maxX -= meta.minX;
    meta.maxY -= meta.minY;
    meta.minX = 0;
    meta.minY = 0;
}

function createCell(rowIndex, columnIndex, coords) {
    const cell = { candidates: [], distance: Infinity, distanceSum: 0 };

    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const distance = Math.abs(coord.y - rowIndex) + Math.abs(coord.x - columnIndex);

        cell.distanceSum += distance;

        if (cell.distance > distance) {
            cell.distance = distance;
            cell.candidates = [i];
        } else if (cell.distance === distance) {
            cell.candidates.push(i);
        }
    }

    return cell;
}

function createBoard(coords, meta) {
    normalizeCoords(coords, meta);

    const rowsCount = meta.maxY + 1;
    const columnCount = meta.maxX + 1;
    const edgedCandidates = new Set();
    const countPerCandidate = new Array(coords.length).fill(0);

    const board = new Array(rowsCount).fill(null).map((_, rowIndex) => {
        return new Array(columnCount).fill(null).map((_, columnIndex) => {
            const cell = createCell(rowIndex, columnIndex, coords);

            if (rowIndex === 0 || columnIndex === 0 || rowIndex === meta.maxY || columnIndex === meta.maxX) {
                if (cell.candidates.length === 1) {
                    cell.candidates.forEach(candidate => edgedCandidates.add(candidate));
                }
            }

            if (cell.candidates.length === 1) {
                countPerCandidate[cell.candidates[0]] += 1;
            }

            return cell;
        });
    });

    return [board, edgedCandidates, countPerCandidate];
}

function findLargestArea(coords, edgedCandidates, countPerCandidate) {
    return coords.reduce((max, coord, candidate) => {
        if (edgedCandidates.has(candidate)) {
            return max;
        }
        return (max > countPerCandidate[candidate]) ? max : countPerCandidate[candidate];
    }, 0);
}

function findSafeSize(board, threshold) {
    return board.reduce((sum, row) => {
        return row.reduce((sum, cell) => {
            return (cell.distanceSum < threshold) ? (sum + 1) : sum;
        }, sum);
    }, 0);
}

function findAreas() {
    return readCoordinates().then(([coords, meta]) => {
        const [board, edgedCandidates, countPerCandidate] = createBoard(coords, meta);

        result('[06.0]', findLargestArea(coords, edgedCandidates, countPerCandidate), 4589);
        result('[06.1]', findSafeSize(board, 10000), 40252);
    });
}

findAreas();
