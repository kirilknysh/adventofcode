const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');
const KEY_DURATION_SHIFT = 'A'.charCodeAt(0) - 1;

function parseDepLine(line) {
    const [, prev, ,,,,, next] = line.split(' ');
    return [prev, next];
}

function parseDepLines(deps, lines) {
    lines.reduce((deps, line) => {
        deps.push(parseDepLine(line));
        return deps;
    }, deps);
}

function readInput() {
    const deps = [];

    return input.readLines(inputFilePath, parseDepLines.bind(null, deps))
        .then(() => deps);
}

function calculateUnitDuration(key, minDuration) {
    return minDuration + key.charCodeAt(0) - KEY_DURATION_SHIFT;
}

function createUnit(key, minDuration) {
    return { key, children: [], parents: [], duration: calculateUnitDuration(key, minDuration) };
}

function constructChain(deps, minDuration) {
    const chain = new Map();
    const roots = new Set();

    deps.forEach((dep) => {
        let unit = chain.get(dep[0]) || createUnit(dep[0], minDuration);
        unit.children.push(dep[1]);
        chain.set(dep[0], unit);
        if (unit.parents.length === 0) {
            roots.add(unit.key);
        }
        unit = chain.get(dep[1]) || createUnit(dep[1], minDuration);
        unit.parents.push(dep[0]);
        chain.set(dep[1], unit);
        roots.delete(unit.key);
    });

    return [chain, roots];
}

function buildChain(minDuration) {
    return readInput().then((deps) => {
        return constructChain(deps, minDuration);
    });
}

function isUnitReady(unit, path) {
    return unit.parents.every((key) => path.has(key));
}

function findPath(chain, roots) {
    const path = new Set();
    let pathStr = '';
    const readyUnitKeys = [...roots].sort();

    while (readyUnitKeys.length) {
        const key = readyUnitKeys.shift();
        const unit = chain.get(key);

        path.add(key);
        pathStr += key;
        unit.children.forEach((key) => {
            const unit = chain.get(key);
            if (isUnitReady(unit, path)) {
                readyUnitKeys.push(unit.key);
            }
        });

        readyUnitKeys.sort();
    }

    return pathStr;
}

function createJob(unit) {
    return { key: unit.key, startAt: -1, duration: unit.duration };
}

function isPlanned(job) {
    return job.startAt < 0;
}

function isComplete(job, now) {
    return job.startAt + job.duration === now;
}

function calculateTime(chain, roots, workersCount) {
    const done = new Set();
    let ongoingJobs = [...roots].map((key) => createJob(chain.get(key)));
    let time = 0;
    let availableWorkers = workersCount;

    while (ongoingJobs.length) {
        let timeShift = Infinity;
        const newOngoingJobs = [];
        // stop complete jobs
        ongoingJobs.forEach((job) => {
            if (isPlanned(job) || !isComplete(job, time)) {
                return newOngoingJobs.push(job);
            }

            done.add(job.key);
            availableWorkers += 1;
            chain.get(job.key).children.forEach((key) => {
                const unit = chain.get(key);
                isUnitReady(unit, done) && newOngoingJobs.push(createJob(unit));
            })
        });
        newOngoingJobs.sort((a, b) => a.key.charCodeAt(0) - b.key.charCodeAt(0));
        // start new jobs if possible
        newOngoingJobs.forEach((job) => {
            if (availableWorkers > 0 && job.startAt < 0) {
                job.startAt = time;
                availableWorkers -= 1;
            }
            if (job.startAt > -1) {
                timeShift = Math.min(timeShift, job.startAt + job.duration - time);
            }
        });

        ongoingJobs = newOngoingJobs;

        time += ongoingJobs.length ? timeShift : 0;
    }

    return time;
}

function processSteps() {
    return buildChain(60).then(([chain, roots]) => {
        result('[07.0]', findPath(chain, roots), 'ACBDESULXKYZIMNTFGWJVPOHRQ');
        result('[07.1]', calculateTime(chain, roots, 5), 980);
    });
}

processSteps();
