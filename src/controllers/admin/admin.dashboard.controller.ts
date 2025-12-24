import { Request, Response } from "express";
import {Role, User} from "../../models/user.model";
import { Challenge} from "../../models/challenge.model";
import {Submission, SubmissionStatus} from "../../models/submission.model";

export const getDashboardStats = async (req: Request, res: Response) => {
    try{
        const [
            totalStudents,
            totalChallenges,
            totalSubmissions,
            recentActivity,
            dailyActivity
        ] = await Promise.all([
            User.countDocuments({ roles: Role.STUDENT }),
            Challenge.countDocuments({}),
            Submission.countDocuments({}),
            Submission.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("user", "firstname lastname avatarUrl")
                .populate("challenge", "title"),
            // E. Chart Data (Last 7 Days) using Aggregation
            Submission.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ])

        // 2. Calculate Pass Rate (Bonus Logic)
        const passedSubmissions = await Submission.countDocuments({ status: SubmissionStatus.PASSED });
        const passRate = totalSubmissions > 0
            ? Math.round((passedSubmissions / totalSubmissions) * 100)
            : 0;

        /// 3. Format Response (SAFE MAPPING)
        const safeRecentActivity = recentActivity.map((sub: any) => {
            // SAFETY CHECK: Handle deleted users or challenges
            const userName = sub.user ? `${sub.user.firstname} ${sub.user.lastname}` : "Unknown User";
            const challengeTitle = sub.challenge ? sub.challenge.title : "Unknown Challenge";

            return {
                user: userName,
                action: sub.status === SubmissionStatus.PASSED
                    ? `Solved '${challengeTitle}'`
                    : `Attempted '${challengeTitle}'`,
                time: timeAgo(new Date(sub.createdAt)), // Helper function below
                status: sub.status === SubmissionStatus.PASSED ? "success" : "failed"
            };
        })

        res.status(200).json({
            counts: {
                students: totalStudents,
                challenges: totalChallenges,
                submissions: totalSubmissions,
                passRate: passRate
            },
            chartData: dailyActivity.map(day => ({
                name: day._id,
                submissions: day.count
            })),
            recentActivity: safeRecentActivity
        })
    } catch (error) {
        console.error("Dashboard Error:", error)
        res.status(500).json({ message: "Failed to load dashboard stats" })
    }
}

// --- Helper: Simple "Time Ago" formatter ---
function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return "Just now";
}