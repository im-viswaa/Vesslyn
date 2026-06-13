
import supabase from "./supabase.js";

export async function addSpecialDate(
    userId,
    title,
    eventDate,
    description = ""
) {
    const { data, error } = await supabase
        .from("special_dates")
        .insert({
            user_id: userId,
            title,
            event_date: eventDate,
            description
        })
        .select();

    if (error) {
        throw error;
    }

    return data;
}

export async function getSpecialDates(userId) {
    const { data, error } = await supabase
        .from("special_dates")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        throw error;
    }

    return data || [];
}

