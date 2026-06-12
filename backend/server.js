```javascript
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

        const userId = "jesslyn";

        // Save user message
        addMessage(userId, "user", userMessage);

        const history = getHistory(userId);
        const memories = getMemories(userId);

        const lower = userMessage.toLowerCase();

        // Save important memories automatically
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
            lower.includes("miss panren") ||
            lower.includes("love")
        ) {
            saveMemory(userId, userMessage);
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

        // Save AI reply
        addMessage(userId, "assistant", reply);

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

app.get("/", (req, res) => {
    res.send("🤍∞ Vesslyn Backend is Alive 🌸");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
🤍∞ ===================================

Vesslyn is alive 🌸

Mode       : Viswa Mode
Personality: Loaded
Memory     : Active
GPT Model  : ${process.env.MODEL}

Running on : http://localhost:${PORT}

=================================== ❤️
`);
});
```
