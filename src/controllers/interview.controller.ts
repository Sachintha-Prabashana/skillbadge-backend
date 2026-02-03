import { Request, Response } from 'express';
import { Interview } from "../models/interview.model";
import { AuthRequest } from "../middleware/auth";
import { openRouterClient } from "../utils/openrouter";

// src/controllers/interview.controller.ts

async function getAIResponse(messages: any[]) {
    const models = [
        "google/gemini-2.0-flash-lite-preview-02-05:free", // 1. Google (Very Fast)
        "meta-llama/llama-3.2-3b-instruct:free",           // 2. Llama (Backup)
        "deepseek/deepseek-r1-distill-llama-70b:free"      // 3. DeepSeek (Final Backup)
    ];

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}...`);
            const completion = await openRouterClient.chat.completions.create({
                model: model,
                messages: messages
            });
            return completion.choices[0]?.message?.content || "No response generated.";
        } catch (error: any) {
            if (error.status === 429 || error.status === 503) {
                console.warn(`Model ${model} failed (Rate Limit). Switching to next...`);
                continue;
            }
            throw error;
        }
    }
    throw new Error("All AI models are currently busy. Please try again later.");
}

// 1 . start a new interview session

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

        const firstQuestion = await getAIResponse([{ role: "system", content: systemPrompt }]);

        // Save the first question to the interview messages
        interview.messages.push({ role: "assistant", content: firstQuestion });
        await interview.save();

        res.status(201).json({
            interviewId: interview._id,
            stream: interview.stream,
            difficulty: interview.difficulty,
            message: firstQuestion
        });

    } catch (error) {
        console.error("Start Interview Error:", error);
        res.status(500).json({ message: "Failed to initialize interview" });
    }
}

export const chatInterview = async (req: AuthRequest, res: Response) => {
    try {
        const { interviewId, userAnswer } = req.body;
        const QUESTION_LIMIT = 10;

        // validate interview ownership
        const interview = await Interview.findOne({ _id: interviewId, user: req.user?.sub });
        if (!interview ) return res.status(404).json({ message: "Session not found" });

        if (interview.status === "COMPLETED") {
            return res.status(400).json({ message: "This interview is already finished." });
        }

        // 2. Save User Answer
        interview.messages.push({ role: "user", content: userAnswer });

        // 3. Count Questions (User messages count)
        const answerCount = interview.messages.filter(m => m.role === "user").length;
        let isFinalRound = false;
        let systemInstruction = "";

        // 4. Determine AI Instruction (Logic for ending interview)
        if (answerCount >= QUESTION_LIMIT) {
            isFinalRound = true;
            systemInstruction = `
                This is the final answer (${answerCount}/${QUESTION_LIMIT}).
                STOP asking questions.
                Provide a "Final Feedback Report" with Score (0-100), Strengths, and Weaknesses.
                End with "Interview Completed."
            `;
        } else {
            systemInstruction = `
                The candidate has answered question ${answerCount}/${QUESTION_LIMIT}.
                Give brief feedback and ask the NEXT question related to ${interview.stream}.
            `;
        }

        // 5. Prepare History for AI
        const history = [
            ...interview.messages.map(m => ({
                role: m.role as "system" | "user" | "assistant",
                content: m.content
            })),
            { role: "system", content: systemInstruction }
        ];

        const aiReply = await getAIResponse(history);

        // 5. Save AI Reply
        interview.messages.push({ role: "assistant", content: aiReply });

        if (isFinalRound) {
            interview.status = "COMPLETED";
        }
        await interview.save();

        res.json({
            message: aiReply,
            currentQuestion: answerCount + 1,
            isCompleted: isFinalRound,
            history: interview.messages
        });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Error processing your answer" });
    }
}