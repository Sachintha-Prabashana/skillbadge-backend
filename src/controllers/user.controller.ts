import { Request, Response} from "express"
import { User } from "../models/user.model"
import { AuthRequest } from "../middleware/auth";
import {Submission} from "../models/submission.model";
import {uploadToCloudinary} from "../utils/cloudinary";

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

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        // if param is "me", use the logges-in ID . otherwise use the requested ID
        const targetId = req.params.id === "me" ? req.user?.sub : req.params.id

        const user = await User.findById(targetId)
            .select("-password")
            .populate("badges")

        if (!user) return res.status(404).json({ message: "User not found" })

        // 2. Fetch Submission Stats (Count by difficulty)
        // (This requires looking up the Challenge difficulty for every submission)
        // For MVP efficiency, we will just count total submissions for now.
        const totalSubmissions = await Submission.countDocuments({ user: targetId })

        const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1

        res.status(200).json({
            ...user.toObject(),
            totalSubmissions,
            rank
        })

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user profile" })

    }
}

export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" })
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatarUrl: imageUrl },
            { new: true } // Return the updated document
        ).select("-password")

        res.status(200).json({
            message: "Profile picture updated successfully",
            data: updatedUser
        })

    } catch (error) {
        console.error("Upload Error:", error)
        res.status(500).json({ message: "Failed to upload profile picture" })

    }
}