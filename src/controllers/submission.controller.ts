import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Challenge } from "../models/challenge.model";
import { User } from "../models/user.model";
import { Submission, SubmissionStatus } from "../models/submission.model";
import { executeCode } from "../utils/piston";
import {checkAndAwardBadges} from "../service/badge.service";


export const runCode = async (req: AuthRequest, res: Response) => {
    try {
        const { challengeId, code, language } = req.body;
        const userId = req.user?.sub;

        // 1. Fetch Challenge
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        // 2. RUN CODE (Piston Logic)
        const results = [];
        let allPassed = true;

        for (const testCase of challenge.testCases) {
            const pistonRes = await executeCode(language, code, testCase.input);
            const actualOutput = pistonRes.run.stdout ? pistonRes.run.stdout.trim() : "";
            const expectedOutput = testCase.output.trim();
            const isCorrect = !pistonRes.run.stderr && (actualOutput === expectedOutput);

            if (!isCorrect) allPassed = false;

            results.push({
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: pistonRes.run.stderr || actualOutput,
                passed: isCorrect,
                isHidden: testCase.isHidden
            });
        }

        const status = allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;

        // --- 3. DATABASE UPDATES ---
        if (userId) {

            // A. Save Submission History (Audit Log)
            await Submission.create({
                user: userId,
                challenge: challengeId,
                language,
                code,
                status,
                passedCases: results.filter(r => r.passed).length,
                totalCases: results.length,
                pointsEarned: allPassed ? challenge.points : 0
            });

            // B. Update User Stats (ONLY if Passed)
            let newBadges: any[] = [];

            if (allPassed) {
                const user = await User.findById(userId);

                if (user) {
                    // --- STREAK CALCULATION ---
                    const today = new Date().setHours(0,0,0,0);
                    const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate).setHours(0,0,0,0) : 0;
                    const oneDay = 24 * 60 * 60 * 1000;

                    if (today - lastSolved === oneDay) {
                        user.currentStreak += 1; // Consecutive day
                    } else if (today !== lastSolved) {
                        user.currentStreak = 1; // Missed a day or first time
                    }
                    // (If today === lastSolved, streak stays the same)

                    user.lastSolvedDate = new Date();

                    // --- POINTS CALCULATION ---
                    // Check if already solved (prevent double points)
                    const alreadySolved = user.completedChallenges.some(
                        (id) => id.toString() === challengeId
                    );

                    if (!alreadySolved) {
                        user.completedChallenges.push(challengeId as any);
                        user.points += challenge.points;
                    }

                    await user.save();

                    // --- TRIGGER BADGE CHECK ---
                    newBadges = await checkAndAwardBadges(userId);
                }
            }

            // 4. Return Final Response
            return res.json({
                status,
                results,
                newBadges // Send this to Frontend to show the "Badge Unlocked" Popup
            });
        }

        // Guest User Response
        return res.json({ status, results });

    } catch (error: any) {
        console.error("Execution Error:", error.message);
        res.status(500).json({ message: "Error executing code" });
    }
}