import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in .env file.");
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "SkillBadge Platform",
    },
});

export const generateChallengeWithAI = async (topic: string) => {
    // Priority List: Free & Reliable models
    const modelsToTry = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "mistralai/mistral-nemo:free"
    ];

    for (const model of modelsToTry) {
        try {
            console.log(`AI: Trying model '${model}'...`);

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "You are a JSON generator for a coding platform. Return ONLY valid raw JSON. No Markdown formatting."
                    },
                    {
                        role: "user",
                        content: `Generate a coding challenge about: "${topic}".
            
            Structure must match exactly:
            {
              "title": "String",
              "description": "String (Markdown supported)",
              "difficulty": "EASY" | "MEDIUM" | "HARD", 
              "points": 10,
              "categories": ["String"],
              "tips": ["Tip 1"],
              "allowedLanguages": ["python", "javascript", "java", "cpp"],
              "starterCode": [
                { "language": "python", "code": "String" },
                { "language": "javascript", "code": "String" },
                { "language": "java", "code": "String" },
                { "language": "cpp", "code": "String" }
              ],
              "testCases": [
                { "input": "1 2", "output": "3", "isHidden": false }
              ]
            }

            CRITICAL INSTRUCTIONS:
            1. Description: Use Markdown. Include "### Example 1:" with code blocks and "### Constraints:".
            2. Categories: Include 1-3 relevant tags (e.g., "Array", "Dynamic Programming", "String", "Math").
            
            3. Starter Code (IMPORTANT): 
               - You MUST include the boilerplate to read from STDIN (Standard Input).
               - However, rename the solution function to match the problem context.
               - Example: If the problem is "Sum Array", name the function 'sumArray(arr)'.
               
               Template expectations:
               - Python: import sys... read stdin... call specific function.
               - JS: fs.readFileSync... parse input... call specific function.
               - Java: Scanner class... read input... call specific static method.
               - C++: #include <iostream>... main() reads cin... call specific function.
            `
                    }
                ],
                temperature: 0.2,
            });

            const textResponse = completion.choices[0].message.content;

            if (!textResponse) throw new Error("Empty response from AI");

            const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

            return JSON.parse(cleanJson);

        } catch (error: any) {
            console.warn(`⚠️ Model '${model}' failed:`, error.message || error);
        }
    }

    throw new Error("All free AI models failed. Please try again later.");
};