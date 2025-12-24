import { Request, Response } from "express";
import { Challenge } from "../../models/challenge.model";

export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { 
      title, description, tips, difficulty, points, 
      allowedLanguages, starterCode, testCases 
    } = req.body;

    // Validation
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ message: "At least one test case is required." });
    }

    const newChallenge = new Challenge({
      title,
      description,
      tips, // Array of strings
      difficulty,
      points,
      allowedLanguages,
      starterCode, // Array of objects { language, code }
      testCases    // Array of objects { input, output }
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
        const sort = req.query.sort as string || "-createdAt"; // Default: Newest first

        // 2. Build the Filter Object
        const query: any = {};

        // Search by Title (Case-insensitive regex)
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // Filter by Difficulty (Exact match)
        if (difficulty && difficulty !== "All") {
            query.difficulty = difficulty;
        }

        // 3. Calculation for Pagination
        const skip = (page - 1) * limit;

        // 4. Run Queries in Parallel (Faster)
        const [challenges, total] = await Promise.all([
            Challenge.find(query)
                // ⚡ OPTIMIZATION: Only select fields needed for the table
                // We DO NOT fetch 'description', 'starterCode', or 'testCases' here
                .select("title difficulty category points createdAt slug")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(), // ⚡ OPTIMIZATION: Returns plain JS objects instead of Mongoose Documents (Faster)

            Challenge.countDocuments(query)
        ])

        // 5. Send Standard Response
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