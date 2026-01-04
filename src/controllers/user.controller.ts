import { Request, Response} from "express"
import {Role, User} from "../models/user.model"
import { AuthRequest } from "../middleware/auth";
import { Submission, SubmissionStatus } from "../models/submission.model";
import { Challenge, Difficulty } from "../models/challenge.model";
import {uploadToCloudinary} from "../utils/cloudinary";
import {BADGE_MANIFEST} from "../config/seeds/badgeManifest";
import {checkAndAwardBadges} from "../service/badge.service";

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await User.find({ roles: Role.STUDENT})
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

        // await checkAndAwardBadges(targetId);

        // 1. Fetch Basic User Info
        // Note: We use lean() to get a plain JS object, making it easier to modify 'badges'
        const user = await User.findById(targetId).select("-password").populate("badges").lean();

        if (!user) return res.status(404).json({message: "User not found"});

        // ---  NEW: BADGE HYDRATION LOGIC ---
        // We merge the DB data with the Manifest data
        const enrichedBadges = (user.badges || []).map((userBadge: any) => {
            // Find the visual details in the manifest based on the badge name
            // (Assuming userBadge has a .name property or is the badge object itself)
            const badgeName = userBadge.name || userBadge;
            const manifestData = BADGE_MANIFEST.find(b => b.name === badgeName);

            if (!manifestData) return userBadge; // Fallback if not found in manifest

            return {
                ...userBadge, // Keep DB data (like _id, dateEarned)
                // Add Visual Data from Manifest:
                displayName: manifestData.name,
                description: manifestData.description,
                icon: manifestData.icon,      // e.g., "Flame"
                color: manifestData.color,    // e.g., "text-red-500"
            };
        })

        // 2. Calculate Rank
        const rank = await User.countDocuments({points: {$gt: user.points}}) + 1;

        // 3. AGGREGATION: Solved Breakdown
        const solvedStats = await Submission.aggregate([
            {$match: {user: user._id, status: SubmissionStatus.PASSED}},
            {
                $lookup: {
                    from: "challenges",
                    localField: "challenge",
                    foreignField: "_id",
                    as: "challengeInfo"
                }
            },
            {$unwind: "$challengeInfo"},
            {$group: {_id: "$challengeInfo.difficulty", count: {$sum: 1}}}
        ]);

        const solvedMap: any = {EASY: 0, MEDIUM: 0, HARD: 0};
        solvedStats.forEach(s => solvedMap[s._id] = s.count);

        // 4. Get Total Counts
        const totalEasy = await Challenge.countDocuments({difficulty: "EASY"});
        const totalMedium = await Challenge.countDocuments({difficulty: "MEDIUM"});
        const totalHard = await Challenge.countDocuments({difficulty: "HARD"});

        // 5. AGGREGATION: Languages
        const languageStats = await Submission.aggregate([
            {$match: {user: user._id, status: SubmissionStatus.PASSED}},
            {$group: {_id: "$language", count: {$sum: 1}}},
            {$sort: {count: -1}}
        ]);

        // 6. Recent Activity
        const recentActivity = await Submission.find({user: user._id})
            .sort({createdAt: -1})
            .limit(5)
            .populate("challenge", "title slug");

        // 7. Heatmap Data
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
            title: user.title || "Student Developer",
            about: user.about || "",
            country: user.country || "Earth",
            socials: user.socials,
            education: user.education,

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

            languages: languageStats.map(l => ({name: l._id, problems: l.count})),
            submissionCalendar: calendar,

            //  Return the ENRICHED badges, not the raw DB ones
            badges: enrichedBadges,

            recentActivity: recentActivity.map(sub => ({
                title: (sub.challenge as any).title,
                time: sub.createdAt,
                status: sub.status
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

export const getMySolvedList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;

        const solvedSubmissions = await Submission.find({
            user: userId,
            status: SubmissionStatus.PASSED
        }).select("challengeId")

        if (!solvedSubmissions.length) {
            return res.json([]); // Return empty list immediately if nothing solved
        }

        // 2. Extract unique Challenge IDs using Set
        const uniqueChallengeIds = [...new Set(solvedSubmissions.map(s => s.challenge.toString()))];

        // 3. Fetch Challenge Details
        const challenges = await Challenge.find({
            _id: { $in: uniqueChallengeIds }
        }).select("title difficulty category points");

        res.json(challenges);

    } catch (error) {
        console.error("Error fetching solved list:", error);
        res.status(500).json({ message: "Failed to fetch solved problems" });
    }
}

export const getUserProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        const solvedSubmissions = await Submission.find({
            user: userId,
            status: SubmissionStatus.PASSED
        }).select("challenge createdAt");

        // 2. Calculate Counts (Unique Problems Only)
        const uniqueSolvedIds = [...new Set(solvedSubmissions.map(s => s.challenge.toString()))];

        // Fetch problem details to categorize by difficulty
        const solvedProblems = await Challenge.find({ _id: { $in: uniqueSolvedIds } }).select("difficulty");

        const stats = {
            total: uniqueSolvedIds.length,
            easy: solvedProblems.filter(p => p.difficulty === Difficulty.EASY).length,
            medium: solvedProblems.filter(p => p.difficulty === Difficulty.MEDIUM).length,
            hard: solvedProblems.filter(p => p.difficulty === Difficulty.HARD).length
        };

        // 3. Generate Heatmap Data (Count submissions per day)
        // Format: { "2023-10-25": 4, "2023-10-26": 1 }
        const heatmap: Record<string, number> = {};
        solvedSubmissions.forEach(sub => {
            const date = sub.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            heatmap[date] = (heatmap[date] || 0) + 1;
        });

        // 4. Fetch Recent Activity (Last 5 submissions, passed or failed)
        const recentActivity = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("challenge", "title difficulty"); // Populate problem details

        res.json({ stats, heatmap, recentActivity });

    } catch (error) {
        console.error("Progress Error:", error);
        res.status(500).json({ message: "Failed to fetch progress" });
    }
}