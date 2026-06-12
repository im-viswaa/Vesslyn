import fs from "fs";

const FILE = "./userMemory.json";

export function getMemory() {
    try {
        return JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch {
        return {
            favoriteFood: "",
            favoriteColor: "",
            nicknames: [],
            importantDates: {},
            likes: [],
            dislikes: [],
            memories: []
        };
    }
}

export function saveMemory(memory) {
    fs.writeFileSync(FILE, JSON.stringify(memory, null, 2));
}

export function addMemory(text) {
    const memory = getMemory();

    memory.memories.push({
        text,
        date: new Date().toISOString()
    });

    saveMemory(memory);
}

export function addLike(item) {
    const memory = getMemory();

    if (!memory.likes.includes(item)) {
        memory.likes.push(item);
    }

    saveMemory(memory);
}

export function addDislike(item) {
    const memory = getMemory();

    if (!memory.dislikes.includes(item)) {
        memory.dislikes.push(item);
    }

    saveMemory(memory);
}