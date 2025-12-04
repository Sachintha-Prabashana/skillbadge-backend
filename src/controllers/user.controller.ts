import { Request, Response} from "express"
import { User } from "../models/user.model"

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await User.find()
            .select("firstname lastname points currentStreak badges")

            // 3. Populate Badges (Join with Badge collection)
            // This turns the array of IDs ["65a...", "65b..."] into Objects [{ name: "Gold", ... }]
            .populate({
                path: "badges",
                select: "name icon color description"
            })

            .sort({ points: -1})  // Descending (Highest first)
            .limit(50)
            .lean()     // Performance: Return plain JSON, not Mongoose Docs

        res.status(200).json(leaderboard)


    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
}