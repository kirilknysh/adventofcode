const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');
const MAGIC_MARBLE = 23;
const MAGIC_MARGIN = 7;

function parseConfig(config, lines) {
    if (!lines.length) {
        return;
    }
    const [players, ,,,,, last] = lines[0].split(' ');
    config.players = +players;
    config.last = +last;
}

function readConfig() {
    const config = { players: 0, last: 0 };

    return input.readLines(inputFilePath, parseConfig.bind(null, config))
        .then(() => config);
}

function createMarble(value) {
    return { value, prev: null, next: null };
}

function play(players, last) {
    const scores = (new Array(players)).fill(0);

    let current = createMarble(0);
    current.prev = current;
    current.next = current;

    for (let i = 1; i <= last; i++) {
        if (i % MAGIC_MARBLE === 0) {
            for (let j = 0; j < MAGIC_MARGIN - 1; j++) {
                current = current.prev;
            }
            scores[i % players] += (i + current.prev.value);
            // remove -7 marble
            current.prev.prev.next = current;
            current.prev = current.prev.prev;
        } else {
            const left = current.next;
            const right = left.next;
            current = createMarble(i);
            current.prev = left;
            current.next = right;
            right.prev = current;
            left.next = current;
        }
    }

    return Math.max(...scores);
}

function marble() {
    return readConfig().then((config) => {
        result('[09.0]', play(config.players, config.last), 385820);
        result('[09.1]', play(config.players, config.last * 100), 3156297594);
    });
}

marble();
