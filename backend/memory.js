const MAX_HISTORY = 20;

const conversations = new Map();

export function addMessage(userId, role, content) {
    if (!conversations.has(userId)) {
        conversations.set(userId, []);
    }

    const history = conversations.get(userId);

    history.push({
        role,
        content,
        timestamp: Date.now()
    });

    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

export function getHistory(userId) {
    return conversations.get(userId) || [];
}

export function clearHistory(userId) {
    conversations.delete(userId);
}

export function saveMemory(userId, memory) {
    const key = `${userId}_memories`;

    if (!conversations.has(key)) {
        conversations.set(key, []);
    }

    conversations.get(key).push(memory);
}

export function getMemories(userId) {
    return conversations.get(`${userId}_memories`) || [];
}