import supabase from "./supabase.js";

export async function addMessage(userId, sender, message) {
    await supabase.from("messages").insert({
        user_id: userId,
        sender,
        message
    });
}

export async function getHistory(userId) {
    const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

    return (data || []).reverse();
}

export async function saveMemory(userId, content) {
    await supabase.from("relationship_memories").insert({
        user_id: userId,
        content
    });
}

export async function getMemories(userId) {
    const { data } = await supabase
        .from("relationship_memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

    return data || [];
}