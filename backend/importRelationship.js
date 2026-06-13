
import "dotenv/config";

import fs from "fs";
import path from "path";
import OpenAI from "openai";

import supabase from "./supabase.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const JSON_FOLDER = "./instagram-json";
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function saveBrain(memory) {
    const { data, error } = await supabase
        .from("relationship_brain")
        .insert(memory)
        .select();

    if (error) {
        console.error("❌ Save Error:", error);
        return;
    }

    console.log("❤️ Saved:", data?.[0]?.memory);
}

async function extractMemory(messages) {
    try {
        const text = messages
            .map(
                m =>
                    `${m.sender_name}: ${m.content || ""}`
            )
            .join("\n");

        const completion =
            await client.responses.create({
                model:
                    process.env.MODEL ||
                    "gpt-5.4-mini",

              input: `
You are extracting REAL relationship memories from Viswa and Jesslyn's Instagram chats.

IMPORTANT:
Extract ONLY specific memories.

DO NOT summarize generally.

BAD EXAMPLES:
❌ "They supported each other."
❌ "They cared about each other."
❌ "They discussed college."

GOOD EXAMPLES:
✅ "Jesslyn said 'I love you Sona' for the first time."
✅ "They confessed their feelings on April 20 between 1–3 AM."
✅ "Jesslyn wore a baby pink dress during their Oct 13 meeting outside Sri Ramakrishna College."
✅ "Jesslyn got on Viswa's scooty for the first time on June 6."
✅ "Viswa held Jesslyn's hips during the scooty ride."
✅ "Jesslyn loves purple flowers."
✅ "Jesslyn's birthday is Dec 7, 2007."
✅ "They met Jesslyn's mother and younger sister on June 8."

Extract ONLY memories belonging to these categories:

- special_date
- first_time
- heart_memory
- preference
- precious_moment
- emotional_memory
- family_memory
- future_dream

Importance Scale:
10 = Life-changing moments
8–9 = Extremely precious memories
5–7 = Important memories
1–4 = Small diary memories

Return ONLY valid JSON.

Format:

[
  {
    "category": "",
    "importance": 10,
    "memory": ""
  }
]

If there are no specific memories, return:

[]

Chat:
${text}
`,
                temperature: 0.3,
                max_output_tokens: 500
            });

        const output =
            completion.output_text?.trim() || "[]";

        try {
            return JSON.parse(output);
        } catch {
            console.log(
                "⚠️ Invalid JSON returned:"
            );

            console.log(output);

            return [];
        }

  } catch (err) {

   if (
    err.status === 429 ||
    err.code === "rate_limit_exceeded"
) {

    console.log(
        "⏳ Rate limited. Waiting 15 seconds..."
    );

    await sleep(15000);

    return [];
}

    console.error(
        "❌ Extraction Error:",
        err
    );

    return [];
}
}

async function run() {
    try {

        console.log(
            "==================================="
        );

        console.log(
            "🤍∞ Starting Relationship Import..."
        );

        console.log(
            "Supabase:",
            process.env.SUPABASE_URL
        );

        const files = fs
            .readdirSync(JSON_FOLDER)
            .filter(file =>
                file.endsWith(".json")
            );

        console.log(
            `📂 Found ${files.length} JSON files`
        );

        for (const file of files) {

            console.log(
                `\n📖 Processing ${file}`
            );

            const raw = fs.readFileSync(
                path.join(JSON_FOLDER, file),
                "utf8"
            );

            const json = JSON.parse(raw);

            const messages =
                json.messages || [];

            console.log(
                `💬 Messages: ${messages.length}`
            );

            const chunkSize = 300;

            for (
                let i = 0;
                i < messages.length;
                i += chunkSize
            ) {

                console.log(
                    `📦 Chunk ${
                        Math.floor(i / chunkSize) + 1
                    } / ${
                        Math.ceil(messages.length / chunkSize)
                    }`
                );

                const chunk = messages.slice(
                    i,
                    i + chunkSize
                );

                const memories =
                    await extractMemory(chunk);

                // Small delay to reduce RPM errors
                await sleep(10000);

                for (const memory of memories) {

                    // Exact duplicate check
                    const { data: existing } =
                        await supabase
                            .from("relationship_brain")
                            .select("id")
                            .eq("user_id", "jesslyn")
                            .eq("memory", memory.memory)
                            .limit(1);

                    if (
                        existing &&
                        existing.length > 0
                    ) {

                        console.log(
                            "⏭️ Duplicate skipped:",
                            memory.memory
                        );

                        continue;
                    }

                    await saveBrain({
                        user_id: "jesslyn",

                        category:
                            memory.category || "diary",

                        importance:
                            memory.importance || 1,

                        memory:
                            memory.memory,

                        source: "instagram",

                        memory_date: null,
                    });
                }
            }
        }

        console.log(
            "\n🎉 🤍∞ Relationship Import Complete"
        );

    } catch (error) {

        console.error(
            "❌ Import Error:",
            error
        );
    }
}

run();