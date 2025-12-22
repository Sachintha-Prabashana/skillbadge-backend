import { Request, Response } from "express";
import { DailyChallenge } from "../models/dailyChallenge.model";
import { Challenge } from "../models/challenge.model";

export const getDailyChallengeId = async (req: Request, res: Response) => {
    try {
        // 1. Get Today's Date
        const today = new Date().toISOString().split('T')[0];

        // 2. Check if we already have a challenge for today
        let daily = await DailyChallenge.findOne({ date: today });

        // 3. IF NOT FOUND: Create one (Lazy Load)
        if (!daily) {
            // Pick random EASY or MEDIUM
            const randomChallenge = await Challenge.aggregate([
                { $match: { difficulty: { $in: ["EASY", "MEDIUM"] } } },
                { $sample: { size: 1 } }
            ]);

            if (!randomChallenge.length) {
                return res.status(404).json({ message: "No challenges available." });
            }

            // Save it for consistency
            daily = await DailyChallenge.create({
                date: today,
                challenge: randomChallenge[0]._id
            });
        }

        // 4. Return ONLY the ID (This is fast!)
        res.json({ challengeId: daily.challenge });

    } catch (err) {
        console.error("Daily Challenge Error:", err);
        res.status(500).json({ message: "Server error" });
    }
}