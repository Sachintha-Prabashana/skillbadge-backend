import OpenAI from "openai"
import dotenv from "dotenv"


dotenv.config()

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // <--- CRITICAL for OpenRouter
    apiKey: process.env.OPENROUTER_API_KEY,  // Read the specific key
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173", // Optional: Your app URL
        "X-Title": "CodeRank",                   // Optional: Your app name
    }
})

export const generateHint = async (
    problemTitle: string,
    problemDesc: string,
    userCode: string,
    language: string
): Promise<string> => {

    // Safety check: Dev mode fallback
    if (!process.env.OPENROUTER_API_KEY) {
        return "⚠️ DEV MODE: Connect an OpenAI Key to get real hints. Try checking your loop bounds!";
    }

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful teaching assistant for a coding platform. 
                    The user is stuck on a problem. 
                    Analyze their code and provide ONE specific, short hint (max 2 sentences). 
                    Do NOT provide the full solution code. 
                    Focus on logic errors, edge cases, or optimization.`
                },
                {
                    role: "user",
                    content: `
                    Problem: ${problemTitle}
                    Description: ${problemDesc}
                    Language: ${language}
                    Student Code:
                    ${userCode}
                    `
                }
            ],
            max_tokens: 150, // Keep it short
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content || "Could not generate a hint.";
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to contact AI service");
    }
};