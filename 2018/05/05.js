const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

const UNIT_MIN_VALID_CODE = 'A'.charCodeAt(0);
const UNIT_MAX_VALID_CODE = 'z'.charCodeAt(0);
const UNIT_MEDIAN_CODE = 'Z'.charCodeAt(0);
const UNIT_REACTION_DIFF = UNIT_MAX_VALID_CODE - UNIT_MEDIAN_CODE;

function canReact(unit0, unit1) {
    return Math.abs(unit0 - unit1) === UNIT_REACTION_DIFF;
}

function compress(polymer, units) {
    return units.reduce((polymer, unit) => {
        if (polymer.length && canReact(polymer[polymer.length - 1], unit)) {
            polymer.pop();
        } else {
            polymer.push(unit);
        }

        return polymer;
    }, polymer);
}

function parseUnits(polymer, chars) {
    const validUnits = chars.map(char => char.charCodeAt(0))
        .filter(code => code >= UNIT_MIN_VALID_CODE && code <= UNIT_MAX_VALID_CODE);

    compress(polymer, validUnits);
}

function findShortest(units) {
    let shortest = null;

    for (let i = UNIT_MIN_VALID_CODE; i <= UNIT_MEDIAN_CODE; i++) {
        const filteredUnits = units.filter((unit) => {
            return (unit !== i) && !canReact(unit, i);
        });
        const polymer = compress([], filteredUnits);

        if (!shortest || shortest.length > polymer.length) {
            shortest = polymer;
        }
    }

    return shortest;
}

function readPolymer() {
    const polymer = [];

    return input.readChars(inputFilePath, parseUnits.bind(null, polymer))
        .then(() => polymer);
}

function findPolymer() {
    return readPolymer().then((polymer) => {
        result('[05.0]', polymer.length, 10180);
        result('[05.1]', findShortest(polymer).length, 5668);
    });
}

findPolymer();
