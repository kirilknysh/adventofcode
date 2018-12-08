const fs = require('fs');
const os = require('os');

function parseLines(str) {
    const lines = str.split(os.EOL);
    return [lines, lines.pop()];
}

function parseChars(str) {
    return str.split('');
}

function parseNumbers(str) {
    const numbers = str.replace(os.EOL, ' ').split(' ');
    return [numbers, numbers.pop()];
}

function read(path, action) {
    const stream = fs.createReadStream(path, { encoding: 'utf8', highWaterMark: 20 });

    return new Promise((resolve, reject) => {
        stream.on('data', (data) => {
            action(data, stream);
        }).on('close', resolve);
    });
}

exports.readLines = function (path, action) {
    let inputStr = '';

    return read(path, (str, stream) => {
        let lines = [];
        [lines, inputStr] = parseLines(inputStr + str);

        action(lines, stream);
    });
};

exports.readChars = function (path, action) {
    return read(path, (str, stream) => {
        action(parseChars(str), stream);
    });
};

// assumption: numbers are white-space separated
exports.readNumbers = function (path, action) {
    let inputStr = '';

    return read(path, (str, stream) => {
        let numbers = [];
        [numbers, inputStr] = parseNumbers(inputStr + str);

        action(numbers.map(number => +number), stream);
    })
};
