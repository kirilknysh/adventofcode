const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result, debug } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseOperationString(operationString) {
    return +operationString;
}

function parseOperationStrings(operationStrings) {
    return operationStrings.map(parseOperationString);
}

function applyOperation(frequency, operation) {
    return frequency + operation;
}

function sumFrequencies(frequency, lines) {
    parseOperationStrings(lines).forEach((operation) => {
        frequency.value = applyOperation(frequency.value, operation);
    });
}

function dupeFrequencies(frequency, frequencies, lines, stream) {
    const operations = parseOperationStrings(lines);
    for (const operation of operations) {
        frequency.value = applyOperation(frequency.value, operation);

        if (!frequencies.has(frequency.value)) {
            frequencies.add(frequency.value);
            continue;
        }

        frequency.dupe = frequency.value;
        stream.close();
        break;
    }
}

function findResultFrequency() {
    const frequency = { value: 0 };

    return input.readLines(inputFilePath, sumFrequencies.bind(null, frequency)).then(() => {
        result('[01.0]', frequency.value, 454);
    });
}

function findFirstDupeFrequency(frequency, frequencies) {
    debug(`Find dupe interation ${++frequency.iteration}`);
    input.readLines(inputFilePath, dupeFrequencies.bind(null, frequency, frequencies)).then(() => {
        if (frequency.dupe) {
            return result('[01.1]', frequency.dupe, 566);
        }
        return findFirstDupeFrequency(frequency, frequencies);
    });
}

findResultFrequency()
findFirstDupeFrequency({ value: 0, dupe: null, iteration: -1 }, new Set());
