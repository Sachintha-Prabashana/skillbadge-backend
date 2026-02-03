import { Request, Response } from 'express';
import { Interview } from "../models/interview.model";
import { AuthRequest } from "../middleware/auth";
import { openRouterClient } from "../utils/openrouter";

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

        // Generate the first question using the system prompt
        const completion = await openRouterClient.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [{ role: "system", content: systemPrompt }]
        });

        const firstQuestion = completion.choices[0]?.message?.content || `Welcome to your ${level} ${stream} interview. Ready?`;

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

        // validate interview ownership
        const interview = await Interview.findOne({ _id: interviewId, user: req.user?.sub });
        if (!interview ) return res.status(404).json({ message: "Session not found" });

        if (interview.status === "COMPLETED") {
            return res.status(400).json({ message: "This interview is already finished." });
        }

        // 2. Save User Answer
        interview.messages.push({ role: "user", content: userAnswer });

        // 3. Prepare Context for AI (Map to API format)
        const history = interview.messages.map(m => ({
            role: m.role as "system" | "user" | "assistant",
            content: m.content
        }));

        // 4. Call AI for Feedback + Next Question
        const completion = await openRouterClient.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: history
        });

        const aiReply = completion.choices[0]?.message?.content || "Let's move to the next topic.";

        // 5. Save AI Reply
        interview.messages.push({ role: "assistant", content: aiReply });
        await interview.save();

        res.json({
            message: aiReply,
            history: interview.messages // Optional: return full history if needed by frontend
        });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Error processing your answer" });
    }
}