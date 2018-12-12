const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function llcnrToRule(llcrr, n) {
    return {
        pattern: parseInt(llcrr.replace(/#/g, 1).replace(/\./g, 0), 2),
        value: n === '#' ? 1 : 0,
    };
}

function parseLines(state, lines) {
    lines.forEach((line) => {
        if (!line) {
            return;
        }
        if (line.startsWith('initial state: ')) {
            state.initial = line.substring('initial state: '.length).split('').map(char => char === '#' ? 1 : 0);
        } else {
            const [llcrr, n] = line.split(' => ');
            const rule = llcnrToRule(llcrr, n);
            state.rules.set(rule.pattern, rule);
        }
    });
}

function readInput() {
    const state = { initial: [], rules: new Map() };

    return input.readLines(inputFilePath, parseLines.bind(null, state))
        .then(() => state);
}

function liveGeneration(state) {
    for (let j = 2; j < state.current.length - 2; j++) {
        let potPatternStr = '';
        for (let k = j - 2; k <= j + 2; k++) {
            potPatternStr += state.current[k];
        }
        const pattern = parseInt(potPatternStr, 2);
        const rule = state.rules.get(pattern);
        state.next[j] = rule ? rule.value : state.current[j];
    }
    state.current = state.next;
    if (state.current[2]) {
        state.current.unshift(0);
        state.startWith += 1;
    }
    if (state.current[state.current.length - 3]) {
        state.current.push(0);
    }
}

function buildHash(pots) {
    let hash = '';
    let index = 0;
    for (; index < pots.length; index++) {
        if (pots[index]) {
            break;
        }
    }
    for (; index < pots.length; index++) {
        hash += pots[index];
    }

    return hash;
}

function calculateSum(state) {
    return state.current.reduce((sum, value, index) => {
        if (value) {
            return sum + (index - state.startWith);
        }
        return sum;
    }, 0);
}

function emulateLong(state, n) {
    let prevHash = '';
    let prevSum = 0;

    for (let i = 1; i <= n; i++) {
        liveGeneration(state);

        const hash = buildHash(state.current);
        const sum = calculateSum(state);
        if (hash === prevHash) {
            return [i, sum, sum - prevSum];
        }
        prevHash = hash;
        prevSum = sum;
        state.next = new Array(state.current.length).fill(0);
    }

    return [n, prevSum, 0];
}

function enhanceState(state) {
    state.current = [0, 0, 0].concat(state.initial).concat([0, 0, 0]);
    state.next = new Array(state.current.length).fill(0);
    state.startWith = 3;
}
function longLive(n) {
    return readInput().then((state) => {
        enhanceState(state);
        const [i, sum, delta] = emulateLong(state, n);

        return sum + (n - i) * delta;
    });
}

longLive(20).then((sum) => {
    result('[12.0]', sum, 1623);
});
longLive(50000000000).then((sum) => {
    result('[12.1]', sum, 1600000000401);
});
