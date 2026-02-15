import { Request, Response } from 'express';
import axios from 'axios';
import { Interview } from "../models/interview.model";
import { AuthRequest } from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

// ️ CONFIGURATION

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const MODEL_NAME = "gemini-flash-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

//  HELPER: Axios Gemini Response Generator
async function getGeminiResponse(prompt: string) {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing in .env");
    }

    try {
        const response = await axios.post(
            API_URL,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 60000
            }
        );

        const candidate = response.data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("AI returned empty response.");
        }

        return text.trim();

    } catch (error: any) {
        console.error("Gemini Axios Error:", error.response?.data || error.message);

        const errorMessage = error.response?.data?.error?.message || "Failed to connect to Gemini API";
        throw new Error(errorMessage);
    }
}

// 1. START INTERVIEW
export const startInterview = async (req: AuthRequest, res: Response) => {
    try {
        const { stream, difficulty } = req.body;
        const userId = req.user?.sub;

        if (!stream) {
            return res.status(400).json({ message: "Stream/Topic is required" });
        }
        const level = difficulty || "Beginner";

        const systemPrompt = `
            You are a professional Technical Interviewer conducting a mock interview.
            
            **TOPIC: ${stream}**
            **DIFFICULTY LEVEL: ${level}**
            
            INSTRUCTIONS:
            1. Ask questions specifically tailored to a ${level} level candidate in ${stream}.
            2. Do NOT ask for code implementation. Ask for concepts, scenarios, and problem-solving approaches.
            3. Ask only ONE question at a time.
            4. Wait for the candidate's answer before providing short feedback.
            5. Start immediately by welcoming the candidate to the ${level} ${stream} interview and asking the first question.
        `;

        const interview = await Interview.create({
            user: userId,
            stream,
            difficulty: level,
            messages: [{ role: "system", content: systemPrompt }]
        });

        const firstQuestion = await getGeminiResponse(systemPrompt);

        interview.messages.push({ role: "assistant", content: firstQuestion });
        await interview.save();

        res.status(201).json({
            interviewId: interview._id,
            stream: interview.stream,
            difficulty: interview.difficulty,
            message: firstQuestion
        });

    } catch (error: any) {
        console.error("Start Interview Error:", error.message);
        res.status(500).json({ message: "Failed to initialize interview", details: error.message });
    }
}

// 2. CHAT INTERVIEW
export const chatInterview = async (req: AuthRequest, res: Response) => {
    try {
        const { interviewId, userAnswer, stop } = req.body;
        const QUESTION_LIMIT = 10;

        const interview = await Interview.findOne({ _id: interviewId, user: req.user?.sub });
        if (!interview) return res.status(404).json({ message: "Session not found" });

        if (interview.status === "COMPLETED") {
            return res.status(400).json({ message: "Interview already finished." });
        }

        if (userAnswer) {
            interview.messages.push({ role: "user", content: userAnswer });
        }

        const answerCount = interview.messages.filter(m => m.role === "user").length;
        let isFinalRound = false;
        let systemInstruction = "";

        if (stop || answerCount >= QUESTION_LIMIT) {
            isFinalRound = true;
            systemInstruction = `
                The interview is ENDING now.
                (Reason: ${stop ? "Candidate requested to stop early" : "Question limit reached"}).
                
                DO NOT ASK ANY MORE QUESTIONS.
                
                Provide a structured "Final Feedback Report":
                1. Overall Score (0-100)
                2. Key Strengths
                3. Areas for Improvement
                
                End the response clearly with "Interview Completed".
            `;
        } else {
            systemInstruction = `
                The candidate has answered question ${answerCount}/${QUESTION_LIMIT}.
                1. Provide brief feedback on the answer.
                2. Ask the NEXT technical question related to ${interview.stream}.
                3. Keep it professional and concise.
            `;
        }

        const conversationHistory = interview.messages.map(m => {
            const speaker = m.role === 'user' ? 'Candidate' : (m.role === 'assistant' ? 'Interviewer' : 'System');
            return `${speaker}: ${m.content}`;
        }).join("\n");

        const fullPrompt = `
            ${conversationHistory}
            
            ---
            SYSTEM INSTRUCTION:
            ${systemInstruction}
        `;

        const aiReply = await getGeminiResponse(fullPrompt);

        // 6. Save & Response
        interview.messages.push({ role: "assistant", content: aiReply });

        if (isFinalRound) {
            interview.status = "COMPLETED";
        }
        await interview.save();

        res.json({
            message: aiReply,
            currentQuestion: answerCount,
            totalQuestions: QUESTION_LIMIT,
            isCompleted: isFinalRound
        });

    } catch (error: any) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ message: "Error processing your answer", details: error.message });
    }
}