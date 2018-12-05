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

function compressPolymer(units) {
    return units.reduce((polymer, unit) => {
        if (!polymer.length) {
            polymer.push(unit);
        } else if (canReact(polymer[polymer.length - 1], unit)) {
            polymer.pop();
        } else {
            polymer.push(unit);
        }

        return polymer;
    }, []);
}

function parseUnits(units, chars) {
    const validUnits = chars.map(char => char.charCodeAt(0))
        .filter(code => code >= UNIT_MIN_VALID_CODE && code <= UNIT_MAX_VALID_CODE);

    units.push(...validUnits);
}

function readUnits() {
    const units = [];

    return input.readChars(inputFilePath, parseUnits.bind(null, units))
        .then(() => units);
}

function findShortest(units) {
    let shortest = null;

    for (let i = UNIT_MIN_VALID_CODE; i <= UNIT_MEDIAN_CODE; i++) {
        const filteredUnits = units.filter((unit) => {
            return (unit !== i) && !canReact(unit, i);
        });
        const polymer = compressPolymer(filteredUnits);

        if (!shortest || shortest.length > polymer.length) {
            shortest = polymer;
        }
    }

    return shortest;
}

function findPolymer() {
    return readUnits().then((units) => {
        const compressedPolymer = compressPolymer(units);

        result('[05.0]', compressedPolymer.length, 10180);
        result('[05.1]', findShortest(compressedPolymer).length, 5668);
    })
}

findPolymer();
