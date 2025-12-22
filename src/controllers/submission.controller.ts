import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Challenge } from "../models/challenge.model";
import { User } from "../models/user.model";
import { Submission, SubmissionStatus } from "../models/submission.model";
import { DailyChallenge } from "../models/dailyChallenge.model"; // <--- 1. IMPORT THIS
import { executeCode } from "../utils/piston";
import { checkAndAwardBadges } from "../service/badge.service";


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

            // A. Save Submission History
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
                    // --- 🟢 START: DAILY CHALLENGE STREAK LOGIC ---
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todaysDaily = await DailyChallenge.findOne({ date: todayStr });

                    // We also keep track of generic "Last Solved" for consistency
                    const lastSolvedStr = user.lastSolvedDate
                        ? new Date(user.lastSolvedDate).toISOString().split('T')[0]
                        : null;

                    // 1. Check if this is THE Daily Challenge
                    if (todaysDaily && todaysDaily.challenge.toString() === challengeId) {

                        // Only award streak/bonus if they haven't solved it today
                        if (lastSolvedStr !== todayStr) {
                            user.currentStreak += 1;

                            // Update Personal Best
                            if (user.currentStreak > user.longestStreak) {
                                user.longestStreak = user.currentStreak;
                            }

                            // Give Bonus XP for Daily
                            user.points += 10;

                            // Mark today as active
                            user.lastSolvedDate = new Date();
                        }
                    }
                        // 2. Fallback: If it's NOT the daily challenge, do you still want to update "lastSolvedDate"?
                    // Usually yes, to show they were active.
                    else if (lastSolvedStr !== todayStr) {
                        user.lastSolvedDate = new Date();
                        // Note: We typically DON'T increment streak here if you only want
                        // streaks for the Daily Challenge.
                        // If you want streaks for ANY problem, uncomment below:
                        // user.currentStreak += 1;
                    }



                    // --- STANDARD POINTS CALCULATION ---
                    const alreadySolved = user.completedChallenges.some(
                        (id) => id.toString() === challengeId
                    );

                    if (!alreadySolved) {
                        user.completedChallenges.push(challengeId as any);
                        user.points += challenge.points; // Standard challenge points
                    }

                    await user.save();

                    // --- TRIGGER BADGE CHECK ---
                    newBadges = await checkAndAwardBadges(userId);
                }
            }

            return res.json({
                status,
                results,
                newBadges
            });
        }

        return res.json({ status, results });

    } catch (error: any) {
        console.error("Execution Error:", error.message);
        res.status(500).json({ message: "Error executing code" });
    }
}