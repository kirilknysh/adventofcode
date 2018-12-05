const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function getBoxIdRepeatition(boxId) {
    let two = 0;
    let three = 0;

    const hash = boxId.split('').reduce((hash, char) => {
        if (hash[char]) {
            hash[char] += 1;
        } else {
            hash[char] = 1;
        }
        return hash;
    }, {});
    const keys = Object.keys(hash);
    for (const key of keys) {
        const count = hash[key];
        if (count === 2) {
            two = 1;
        } else if (count === 3) {
            three = 1;
        }
        if (two && three) {
            break;
        }
    }

    return [two, three];
}

function getDiffIndex(box0Id, box1Id) {
    let diffIndex = -1;
    if (box0Id.length !== box1Id.length) {
        return diffIndex;
    }

    let index = -1;
    while (++index < box0Id.length) {
        const box0Char = box0Id[index];
        const box1Char = box1Id[index];
        if (box0Char === box1Char) {
            continue;
        }
        if (diffIndex > -1) {
            diffIndex = -1;
            break;
        }
        diffIndex = index;
    }

    return diffIndex;
}

function getDiff(boxId, allBoxIds) {
    let diffIndex = -1;
    let correctBoxId = '';

    for (correctBoxId of allBoxIds) {
        diffIndex = getDiffIndex(boxId, correctBoxId);
        if (diffIndex > 0) {
            break;
        }
    }

    return [diffIndex, boxId, correctBoxId];
}

function processBoxIds(repeats, diff, lines) {
    lines.forEach((boxId) => {
        const [two, three] = getBoxIdRepeatition(boxId);
        repeats.two += two;
        repeats.three += three;

        const [diffIndex, box0Id, box1Id] = getDiff(boxId, diff.ids);
        if (diffIndex > 0) {
            diff.index = diffIndex;
            diff.box0Id = box0Id;
            diff.box1Id = box1Id;
        }
        diff.ids.push(boxId);
    });
}

function boxIds() {
    const repeats = { two: 0, three: 0 };
    const diff = { index: -1, box0Id: '', box1Id: '', ids: [] };

    return input.readLines(inputFilePath, processBoxIds.bind(null, repeats, diff)).then(() => {
        result('[02.0]', (repeats.two * repeats.three), 7221);
        result('[02.1]', (diff.box0Id.substring(0, diff.index) + diff.box0Id.substring(diff.index + 1)), 'mkcdflathzwsvjxrevymbdpoq');
    });
}

boxIds();
