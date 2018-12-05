const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseAction(logAction) {
    if (logAction === 'falls asleep') {
        return 'asleep';
    }

    if (logAction === 'wakes up') {
        return 'up';
    }

    return 'shift';
}

function parseGuardId(action, logAction) {
    if (action !== 'shift') {
        return -1;
    }

    return +logAction.split(' ')[1].substring(1);
}

function parseLogEntry(logEntry) {
    const logAction = logEntry.substring(19);
    const action = parseAction(logAction)

    return {
        ts: new Date(logEntry.substring(1, 17)),
        action,
        guardId: parseGuardId(action, logAction),
    };
}

function parseSchedules(schedule, lines) {
    lines.map(parseLogEntry).forEach(log => schedule.push(log));
}

function readGuardsSchedule() {
    const schedule = []; // replace w/ sorted linked list

    return input.readLines(inputFilePath, parseSchedules.bind(null, schedule))
        .then(() => schedule.sort((left, right) => left.ts - right.ts));
}

function groupSchedule(schedule) {
    const guards = new Map();
    let currentGuard = null;

    schedule.forEach((log) => {
        if (log.action === 'asleep' || log.action === 'up') {
            currentGuard.logs.push(log);
        }
        if (log.action === 'shift') {
            const guard = guards.get(log.guardId) || { guardId: log.guardId, logs: [], asleepStart: null, asleepDuration: 0 };
            guards.set(log.guardId, guard);
            currentGuard = guard;
        }
    });

    return guards;
}

function getGuardTimings(guard) {
    let minute = 0;
    let intersections = 0;
    let asleepDuration = 0;
    const minutes = new Array(24 * 60).fill(0);
    let asleep = 0;

    guard.logs.forEach((log) => {
        if (log.action === 'asleep') {
            return asleep = log;
        }

        asleepDuration += log.ts - asleep.ts;
        const asleepStart = asleep.ts.getHours() * 60 + asleep.ts.getMinutes();
        const asleepEnd = log.ts.getHours() * 60 + log.ts.getMinutes();
        for (let j = asleepStart; j < asleepEnd; j++) {
            minutes[j] += 1;
            if (intersections < minutes[j]) {
                intersections = minutes[j];
                minute = j;
            }
        }
    });

    return [minute % 60, intersections, asleepDuration];
}

function findMostAsleepGuards(guards) {
    const longest = { guard: null, minute: 0, asleepDuration: 0 };
    const frequent = { guard: null, minute: 0, intersections: 0 };

    guards.forEach((guard) => {
        const [minute, intersections, asleepDuration] = getGuardTimings(guard);

        if (longest.asleepDuration < asleepDuration) {
            longest.guard = guard;
            longest.minute = minute;
            longest.asleepDuration = asleepDuration;
        }
        if (frequent.intersections < intersections) {
            frequent.guard = guard;
            frequent.minute = minute;
            frequent.intersections = intersections;
        }
    });

    return [longest, frequent];
}

function findMostAsleep() {
    return readGuardsSchedule().then((schedule) => {
        const guards = groupSchedule(schedule);
        const [longest, frequent] = findMostAsleepGuards(guards);

        result('[04.0]', (longest.guard.guardId * longest.minute), 125444);
        result('[04.1]', (frequent.guard.guardId * frequent.minute), 18325);
    });
}

findMostAsleep();
