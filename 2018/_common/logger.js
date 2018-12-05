const { deepStrictEqual } = require('assert');

const LEVEL = {
    info: true,
    debug: false,
};

function setup(logLevel) {
    if (!logLevel) {
        return;
    }
    if (logLevel === 'none') {
        return Object.keys(LEVEL).forEach(level => LEVEL[level] = false);
    }
    if (logLevel === 'all') {
        return Object.keys(LEVEL).forEach(level => LEVEL[level] = true);
    }
    logLevel.split(',').forEach((levelCfg) => {
        if (levelCfg.startsWith('+')) {
            LEVEL[levelCfg.substring(1)] = true;
        } else if (levelCfg.startsWith('-')) {
            LEVEL[levelCfg.substring(1)] = false;
        }
    });
}

function setupFromArgv(argv) {
    const arg = argv.find(arg => arg.startsWith('--logLevel'));

    if (!arg) {
        return;
    }

    const [, logLevel] = arg.split('=');

    return setup(logLevel);
}

function info(...messages) {
    if (!LEVEL.info) {
        return;
    }

    console.log('[INFO]', ...messages); /* eslint-disable-line no-console */
}

function debug(...messages) {
    if (!LEVEL.debug) {
        return;
    }

    console.log('\x1b[33m[DEBUG]\x1b[0m', ...messages); /* eslint-disable-line no-console */
}

function result(prefix, actual, expected) {
    if (expected !== undefined) {
        deepStrictEqual(actual, expected);
    }

    console.log('\x1b[32m[RESULT]\x1b[0m', prefix, actual); /* eslint-disable-line no-console */
}

module.exports = {
    setup,
    setupFromArgv,
    info,
    debug,
    result,
};
