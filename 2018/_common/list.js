function createEntry(item) {
    return {
        next: null,
        prev: null,
        payload: item,
    };
}

function link(prev, next) {
    prev.next = next;
    next.prev = prev;
}

function push(list, state, ...items) {
    items.forEach((item) => {
        const entry = createEntry(item);

        if (!state.head) {
            state.head = entry;
        } else if (!state.tail) {
            state.tail = entry;
            link(state.head, state.tail);
        } else {
            link(state.tail, entry);
            state.tail = entry;
        }

        state.size += 1;
    });

    return list;
}

function remove(list, state, ...entries) {
    entries.forEach((entry) => {
        if (state.head === entry) {
            state.head = entry.next;
            state.head && (state.head.prev = null);
        } else if (state.tail === entry) {
            state.tail = entry.prev;
            state.tail && (state.tail.next = null);
        } else {
            link(entry.prev, entry.next);
        }

        if (state.head === state.tail) {
            state.tail = null;
        }

        state.size -= 1;
    });

    return list;
}

function iterator(state) {
    return {
        current: state.head,
        next() {
            if (this.current !== null) {
                const entry = this.current;
                this.current = this.current.next;

                return { value: [entry.payload, entry], done: false };
            }
            return { value: undefined, done: true };
        },
    };
}

function createList() {
    const state = {
        head: null,
        tail: null,
        size: 0,
    };

    const list = {
        get size() { return state.size; },
        [Symbol.iterator]: iterator.bind(null, state),
    };

    list.push = push.bind(null, list, state);
    list.remove = remove.bind(null, list, state);

    return list;
}

exports.createList = createList;
