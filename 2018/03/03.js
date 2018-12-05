const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseClaimsStrings(claims) {
    return claims.map((claimStr) => {
        const parts = claimStr.split(' ');
        const id = parts[0].substring(1);
        const [left, top] = parts[2].substring(0, parts[2].length - 1).split(',').map(margin => +margin);
        const [width, height] = parts[3].split('x').map(size => +size);

        return { id, left, top, width, height };
    });
}

function markClaimOnFabric(claim, fabric, intacts) {
    let isIntact = true;
    for (let i = claim.left; i < (claim.left + claim.width); i++) {
        for (let j = claim.top; j < (claim.top + claim.height); j++) {
            let cell = fabric[i][j];
            if (cell) {
                isIntact = false;
                cell.forEach(id => intacts.delete(id));
                cell.push(claim.id);
            } else {
                cell = [claim.id];
            }
            fabric[i][j] = cell;
        }
    }
    if (isIntact) {
        intacts.add(claim.id);
    }
}

function processClaims(fabric, intacts, lines) {
    parseClaimsStrings(lines).forEach((claim) => {
        markClaimOnFabric(claim, fabric, intacts);
    });
}

function claims() {
    const fabric = (new Array(1000)).fill(null);
    fabric.forEach((_, index) => fabric[index] = (new Array(1000)).fill(null));
    const intacts = new Set();

    return input.readLines(inputFilePath, processClaims.bind(null, fabric, intacts)).then(() => {
        const overlap = fabric.reduce((overlap, row) => {
            return row.reduce((overlap, value) => {
                return overlap + ((value && value.length > 1) ? 1 : 0);
            }, overlap);
        }, 0);
        const [intactId] = [...intacts];
        result('[03.0]', overlap, 121259);
        result('[03.1]', intactId, '239');
    });
}

claims();
