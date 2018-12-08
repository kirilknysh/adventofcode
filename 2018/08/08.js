const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function parseLicense(license, lines) {
    lines.reduce((license, line) => {
        license.push(...line.split(' ').map(char => +char));
        return license;
    }, license);
}

function readLicense() {
    const license = [];

    return input.readLines(inputFilePath, parseLicense.bind(null, license))
        .then(() => license);
}

function buildTree(license, tree) {
    const node = { header: { child: -1, meta: -1 }, children: [], metadata: [], value: 0 };

    if (!tree.root) {
        tree.root = node;
    }

    node.header.child = license[tree.index];
    node.header.meta = license[tree.index + 1];
    tree.index += 2;

    if (node.header.child > 0) {
        for (let i = 0; i < node.header.child; i++) {
            node.children.push(buildTree(license, tree));
        }
    }
    if (node.header.meta > 0) {
        for (let i = 0; i < node.header.meta; i++) {
            const meta = license[tree.index++];
            node.metadata.push(meta);
            tree.metaSum += meta;
        }
    }

    if (node.header.child === 0) {
        node.value = node.metadata.reduce((sum, meta) => sum + meta, 0);
    } else {
        node.value = node.metadata.reduce((sum, meta) => {
            if (meta > node.children.length) {
                return sum;
            }
            return sum + node.children[meta - 1].value;
        }, 0);
    }

    return node;
}

function buildLicense() {
    return readLicense().then((license) => {
        const tree = { root: null, index: 0, metaSum: 0 };
        buildTree(license, tree);
        return tree;
    });
}

function license() {
    return buildLicense().then((tree) => {
        result('[08.0]', tree.metaSum, 41555);
        result('[08.1]', tree.root.value, 16653);
    });
}

license();
