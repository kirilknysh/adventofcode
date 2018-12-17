const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

function makeReceipts(scores, receiptsCount, shift) {
    let elf0 = 0;
    let elf1 = 1;

    while (scores.length < receiptsCount + shift) {
        const score0 = scores[elf0];
        const score1 = scores[elf1];
        const newReceipt = score0 + score1;
        if (newReceipt < 10) {
            scores.push(newReceipt);
        } else {
            scores.push(1, newReceipt % 10); // max is 9+9=18 => 1,8
        }
        elf0 = (elf0 + 1 + score0) % scores.length;
        elf1 = (elf1 + 1 + score1) % scores.length;
    }

    let score = '';
    for (let i = receiptsCount; i < (receiptsCount + shift); i++) {
        score += scores[i];
    }

    return score;
}

function addToScore(score, add, low) {
    if (score.length < low) {
        return score + add;
    }
    return score.substring(1) + add;
}

function findReceipts(scores, target, low) {
    let elf0 = 0;
    let elf1 = 1;
    let score = '';

    while (true) {
        const score0 = scores[elf0];
        const score1 = scores[elf1];
        const newReceipt = score0 + score1;
        if (newReceipt < 10) {
            scores.push(newReceipt);
            score = addToScore(score, newReceipt, low);
            if (score === target) {
                break;
            }
        } else {
            scores.push(1);
            score = addToScore(score, 1, low);
            if (score === target) {
                break;
            }
            scores.push(newReceipt % 10);
            score = addToScore(score, newReceipt % 10, low);
            if (score === target) {
                break;
            }
        }
        elf0 = (elf0 + 1 + score0) % scores.length;
        elf1 = (elf1 + 1 + score1) % scores.length;
    }

    return scores.length - low;
}

const input = 430971;

result('[14.0]', makeReceipts([3, 7], input, 10), '5715102879');
result('[14.1]', findReceipts([3, 7], input + '', (input + '').length), 20225706);
