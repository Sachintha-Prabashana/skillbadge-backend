import { Request, Response } from "express";
import { Challenge } from "../../models/challenge.model";

export const createChallenge = async (req: Request, res: Response) => {
    try {
        const {
            title, description, tips, difficulty, points, categories, // <--- 1. Get categories
            allowedLanguages, starterCode, testCases
        } = req.body;

        // Validation
        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ message: "At least one test case is required." });
        }

        const newChallenge = new Challenge({
            title,
            description,
            tips,
            difficulty,
            points,
            categories, // <--- 2. Save categories
            allowedLanguages,
            starterCode,
            testCases
        });

        await newChallenge.save();

        res.status(201).json({
            message: "Challenge created successfully",
            challengeId: newChallenge._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error creating challenge" });
    }
}

export const getAllChallenges = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || "";
        const difficulty = req.query.difficulty as string || "";
        const category = req.query.category as string || ""; // <--- 3. Read category query
        const sort = req.query.sort as string || "-createdAt";

        // Build the Filter Object
        const query: any = {};

        // Search by Title
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // Filter by Difficulty
        if (difficulty && difficulty !== "All") {
            query.difficulty = difficulty;
        }

        // 4. Filter by Category
        // Mongoose automatically checks if the "categories" array contains this string
        if (category && category !== "All Topics") {
            query.categories = category;
        }

        // Pagination
        const skip = (page - 1) * limit;

        const [challenges, total] = await Promise.all([
            Challenge.find(query)
                // 5. Include 'categories' in the result so frontend can show them
                .select("title difficulty categories points status createdAt")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            Challenge.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            data: challenges,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.error("Get Challenges Error:", error);
        res.status(500).json({ message: "Failed to fetch challenges" });
    }
}