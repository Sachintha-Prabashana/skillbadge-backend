import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const openRouterClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    // defaultHeaders: {
    //     "HTTP-Referer": "http://localhost:5173",
    //     "X-Title": "SkillBadge Platform",
    // },
})