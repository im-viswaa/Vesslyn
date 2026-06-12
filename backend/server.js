
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

import personality from "./personality.js";
import buildPrompt from "./promptBuilder.js";

import {
    addMessage,
    getHistory,
    saveMemory,
    getMemories
} from "./memory.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message?.trim();

        if (!userMessage) {
            return res.status(400).json({
                reply: "Enna ma? 🥺❤️"
            });
        }

        // Since only Jesslyn uses this app
        const userId = "jesslyn";

        // Save user's message permanently
        await addMessage(userId, "user", userMessage);

        // Load previous chats and memories
        const history = await getHistory(userId);
        const memories = await getMemories(userId);

        // Auto-save important memories
        const lower = userMessage.toLowerCase();

        if (
            lower.includes("birthday") ||
            lower.includes("exam") ||
            lower.includes("sad") ||
            lower.includes("stress") ||
            lower.includes("family") ||
            lower.includes("college") ||
            lower.includes("remember") ||
            lower.includes("favorite") ||
            lower.includes("pudikum") ||
            lower.includes("pidikkum") ||
            lower.includes("love") ||
            lower.includes("miss panren") ||
            lower.includes("first time") ||
            lower.includes("special") ||
            lower.includes("anniversary")
        ) {
            await saveMemory(userId, userMessage);
        }

        const prompt = buildPrompt(
            userMessage,
            history,
            memories
        );

        const completion = await client.responses.create({
            model: process.env.MODEL || "gpt-5.4-mini",
            input: prompt,
            temperature: 0.9,
            max_output_tokens: 180
        });

        const reply =
            completion.output_text?.trim() ||
            "Aiyoo ma 🥺❤️ konjam neram kazhichu pesalama?";

        // Save AI reply permanently
        await addMessage(userId, "assistant", reply);

        return res.json({
            reply
        });

    } catch (error) {
        console.error("Chat Error:", error);

        return res.status(500).json({
            reply:
                "Aiyoo thangoo 😭❤️ konjam problem vandhuruchu. Konjam neram kazhichu try pannalama? ✨"
        });
    }
});

// Health Check
app.get("/", (req, res) => {
    res.send("🤍∞ Vesslyn Backend is Alive 🌸");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("===================================");
    console.log("Vesslyn is alive");
    console.log("Mode       : Viswa Mode");
    console.log("Personality: Loaded");
    console.log("Memory     : Supabase Forever Memory Active");
    console.log(`GPT Model  : ${process.env.MODEL}`);
    console.log(`Running on : http://localhost:${PORT}`);
    console.log("===================================");
});
