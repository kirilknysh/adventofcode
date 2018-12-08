const path = require('path');

const input = require('../_common/input');
const { setupFromArgv, result } = require('../_common/logger');

setupFromArgv(process.argv);

const inputFilePath = path.resolve(__dirname, './input.txt');

function createNode(parent) {
    return { header: { child: -1, meta: -1 }, children: [], metadata: [], value: 0, parent };
}

function calculateNodeValue(node) {
    if (node.header.child === 0) {
        return node.metadata.reduce((sum, meta) => sum + meta, 0);
    }
    return node.metadata.reduce((sum, meta) => {
        if (meta > node.children.length) {
            return sum;
        }
        return sum + node.children[meta - 1].value;
    }, 0);
}

function processChars(tree, numbers) {
    numbers.forEach((number) => {
        if (tree.node.header.child < 0) {
            tree.node.header.child = number;
        } else if (tree.node.header.meta < 0) {
            tree.node.header.meta = number;
        } else if (tree.node.children.length < tree.node.header.child) {
            const child = createNode(tree.node);
            child.header.child = number;
            tree.node.children.push(child);
            tree.node = child;
        } else if (tree.node.metadata.length < tree.node.header.meta) {
            tree.node.metadata.push(number);
            tree.metaSum += number;
        }

        // node is fully processed
        if (tree.node.metadata.length === tree.node.header.meta) {
            tree.node.value = calculateNodeValue(tree.node);
            tree.node = tree.node.parent;
        }
    });
}

function buildLicense() {
    const root = createNode(null);
    const tree = { root, metaSum: 0, node: root };

    return input.readNumbers(inputFilePath, processChars.bind(null, tree)).then(() => {
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
