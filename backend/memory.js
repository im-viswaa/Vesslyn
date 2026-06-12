
import supabase from "./supabase.js";

export async function addMessage(userId, sender, message) {
    const { data, error } = await supabase
        .from("messages")
        .insert({
            user_id: userId,
            sender,
            message
        })
        .select();

    console.log("ADD MESSAGE:", { data, error });

    if (error) {
        throw error;
    }

    return data;
}

export async function getHistory(userId) {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

    console.log("GET HISTORY:", { error });

    if (error) {
        throw error;
    }

    return (data || []).reverse();
}

export async function saveMemory(userId, content) {
    const { data, error } = await supabase
        .from("relationship_memories")
        .insert({
            user_id: userId,
            content
        })
        .select();

    console.log("SAVE MEMORY:", { data, error });

    if (error) {
        throw error;
    }

    return data;
}

export async function getMemories(userId) {
    const { data, error } = await supabase
        .from("relationship_memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

    console.log("GET MEMORIES:", { error });

    if (error) {
        throw error;
    }

    return data || [];
}

