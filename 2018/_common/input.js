const fs = require('fs');
const os = require('os');

function parseLines(str) {
    const boxIds = str.split(os.EOL);
    return [boxIds, boxIds.pop()];
}

function parseChars(str) {
    return str.split('');
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
