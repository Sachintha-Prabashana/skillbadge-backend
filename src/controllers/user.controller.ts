import { Request, Response} from "express"
import { User } from "../models/user.model"
import { AuthRequest } from "../middleware/auth";
import {Submission, SubmissionStatus} from "../models/submission.model";
import { Challenge } from "../models/challenge.model";
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
        const targetId = req.params.id === "me" ? req.user?.sub : req.params.id;

        // 1. Fetch Basic User Info
        const user = await User.findById(targetId).select("-password").populate("badges");
        if (!user) return res.status(404).json({message: "User not found"});

        // 2. Calculate Rank (Simple logic: count users with more points)
        const rank = await User.countDocuments({points: {$gt: user.points}}) + 1;

        // 3. AGGREGATION: Solved Breakdown (Easy/Medium/Hard)
        // We group by 'difficulty' field in Submissions
        const solvedStats = await Submission.aggregate([
            {$match: {user: user._id, status: SubmissionStatus.PASSED}}, // Only count accepted
            {
                $lookup: { // Join with Challenges to get difficulty
                    from: "challenges",
                    localField: "challenge",
                    foreignField: "_id",
                    as: "challengeInfo"
                }
            },
            {$unwind: "$challengeInfo"},
            {$group: {_id: "$challengeInfo.difficulty", count: {$sum: 1}}}
        ]);

        // Format the result: [{_id: 'Easy', count: 5}, ...] -> { Easy: 5, Medium: 2 ... }
        const solvedMap: any = {EASY: 0, MEDIUM: 0, HARD: 0};
        solvedStats.forEach(s => solvedMap[s._id] = s.count);

        // 4. Get Total Counts of All Challenges (for the denominator)
        const totalEasy = await Challenge.countDocuments({difficulty: "EASY"});
        const totalMedium = await Challenge.countDocuments({difficulty: "MEDIUM"});
        const totalHard = await Challenge.countDocuments({difficulty: "HARD"});

        // 5. AGGREGATION: Languages & Skills
        // Group submissions by 'language'
        const languageStats = await Submission.aggregate([
            {$match: {user: user._id, status: SubmissionStatus.PASSED}},
            {$group: {_id: "$language", count: {$sum: 1}}},
            {$sort: {count: -1}}
        ]);

        // 6. Recent Activity (Last 5 Submissions)
        const recentActivity = await Submission.find({user: user._id})
            .sort({createdAt: -1})
            .limit(5)
            .populate("challenge", "title slug");

        // 7. Heatmap Data (Calendar)
        const heatmapRaw = await Submission.aggregate([
            {$match: {user: user._id}},
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    count: {$sum: 1}
                }
            }
        ]);
        const calendar: Record<string, number> = {};
        heatmapRaw.forEach(item => {
            calendar[item._id] = item.count
        });

        // --- FINAL RESPONSE ---
        res.json({
            username: user.firstname + " " + user.lastname,
            rank: rank,
            avatarUrl: user.avatarUrl,
            points: user.points,

            // --- NEW PROFILE FIELDS ---
            title: user.title || "Student Developer",
            about: user.about || "",
            country: user.country || "Earth",
            socials: user.socials,
            education: user.education,

            // Data for ProgressSection
            solved: {
                total: solvedMap.EASY + solvedMap.MEDIUM + solvedMap.HARD,
                totalQuestions: totalEasy + totalMedium + totalHard,
                easy: solvedMap.EASY,
                medium: solvedMap.MEDIUM,
                hard: solvedMap.HARD,
                totalEasy,
                totalMedium,
                totalHard
            },

            // Data for ProfileSidebar
            languages: languageStats.map(l => ({name: l._id, problems: l.count})),

            // Data for HeatmapSection
            submissionCalendar: calendar,

            // Data for BadgesSection
            badges: user.badges || [],

            // Data for RecentActivitySection
            recentActivity: recentActivity.map(sub => ({
                title: (sub.challenge as any).title,
                time: sub.createdAt,
                status: sub.status // "ACCEPTED", "WRONG_ANSWER"
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub
        const {
            firstname,
            lastname,
            title,
            about,
            country,
            socials,
            education
        } = req.body

        // Validation (Optional but recommended)
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstname,
                    lastname,
                    title,
                    about,
                    country,
                    socials,    // Replaces the socials object
                    education   // Replaces the education array

                }
            }, {
                new: true, // Return the updated document
                runValidators: true
            }
        ).select("-password")

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal server error" })
    }
}