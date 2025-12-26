import { Request, Response } from "express"
import { Challenge } from "../models/challenge.model"
import { User } from "../models/user.model"
import { AuthRequest } from "../middleware/auth"
import { executeCode } from "../utils/piston"
import {generateChallengeWithAI} from "../utils/ai";
import {generateHint} from "../service/ai.service";
import {DailyChallenge} from "../models/dailyChallenge.model";

export const submitSolution = async (req: AuthRequest, res: Response) => {
    try {
        const {challengeId, code, language} = req.body;
        const userId = req.user?.sub; // Assumes you extracted this from JWT

        // 1. Get Challenge Data
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({message: "Challenge not found"});
        }

        // 2. Check if language is allowed for this specific challenge
        if (!challenge.allowedLanguages.includes(language)) {
            return res.status(400).json({message: `Language ${language} not allowed for this challenge`});
        }

        // 3. Execution Loop
        const results = [];
        let allPassed = true;

        for (const testCase of challenge.testCases) {
            // A. Run Code via Piston
            const result = await executeCode(language, code, testCase.input);

            // B. Normalize Output (Trim whitespace/newlines)
            const actualOutput = result.run.stdout ? result.run.stdout.trim() : "";
            const expectedOutput = testCase.output.trim();
            const errorOutput = result.run.stderr; // Logic errors or syntax errors

            // C. Determine Status
            const isSuccess = !errorOutput && (actualOutput === expectedOutput);

            if (!isSuccess) allPassed = false;

            // D. Prepare Result Object
            results.push({
                input: testCase.isHidden ? "Hidden" : testCase.input,
                expected: testCase.isHidden ? "Hidden" : expectedOutput,
                actual: isSuccess ? actualOutput : (errorOutput || actualOutput), // Show error if crashed
                passed: isSuccess,
                isHidden: testCase.isHidden
            });
        }

        // 4. Update User Points (Only if all passed)
        if (allPassed) {
            // Add logic here to check if user already solved it to avoid double points
            await User.findByIdAndUpdate(userId, {
                $inc: {points: challenge.points},
                $addToSet: {completedChallenges: challengeId}
            });
        }

        // 5. Return Final Response
        res.status(200).json({
            status: allPassed ? "PASSED" : "FAILED",
            message: allPassed ? "All test cases passed!" : "Some test cases failed.",
            results: results
        });

    } catch (error: any) {
        console.error("Execution Error:", error.message);
        res.status(500).json({message: "Error executing code solution"});
    }
}

export const getChallenges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;

        // 1. Extract Query Params
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || "";
        const difficulty = req.query.difficulty as string || "";
        const category = req.query.category as string || "";

        const skip = (page - 1) * limit;

        // 2. Build the Mongoose Filter Object
        const query: any = {};

        // A. Search by Title (Regex)
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // B. Filter by Difficulty
        if (difficulty && difficulty !== "All") {
            query.difficulty = difficulty;
        }

        // C. Filter by Category
        if (category && category !== "All Topics") {
            query.categories = category;
        }

        // 3. Fetch User Progress
        const user = await User.findById(userId).select("completedChallenges");
        if (!user) return res.status(404).json({ message: "User not found" });

        const solvedSet = new Set(user.completedChallenges.map((id) => id.toString()));

        // 4. Get Total Count (MUST Use the query object to count correctly!)
        const totalChallenges = await Challenge.countDocuments(query);

        // 5. Fetch Actual Data
        let challenges = await Challenge.find(query) // <--- PASS QUERY HERE
            .select("title difficulty points categories allowedLanguages createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // --- 🟢 6. PIN DAILY CHALLENGE (Only on Page 1) ---
        // Logic: We only pin it if it matches the current filters.
        // Example: If user filters for "HARD", don't pin the "EASY" daily challenge.
        if (page === 1) {
            const today = new Date().toISOString().split('T')[0];
            const dailyRecord = await DailyChallenge.findOne({ date: today });

            if (dailyRecord) {
                const dailyIdStr = dailyRecord.challenge.toString();

                // Check if the daily challenge is already in the fetched list
                const existingIndex = challenges.findIndex(c => c._id.toString() === dailyIdStr);

                if (existingIndex > -1) {
                    // CASE A: It matches filters and is in the list. Move to top.
                    const [item] = challenges.splice(existingIndex, 1);
                    challenges.unshift(item);
                } else {
                    // CASE B: It's not in the list.
                    // We must check if the Daily Challenge actually MATCHES the user's current filters
                    // before injecting it.
                    const dailyData = await Challenge.findOne({
                        _id: dailyRecord.challenge,
                        ...query // <--- Apply same filters to the daily challenge check
                    })
                        .select("title difficulty points categories allowedLanguages createdAt")
                        .lean();

                    // Only inject if it exists (meaning it passed the filter check)
                    if (dailyData) {
                        challenges.unshift(dailyData);
                    }
                }
            }
        }

        // 7. Format Response
        const formattedChallenges = challenges.map((challenge) => ({
            _id: challenge._id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            points: challenge.points,
            categories: challenge.categories || [], // Return categories
            status: solvedSet.has(challenge._id.toString()) ? "SOLVED" : "TODO"
        }));

        res.status(200).json({
            data: formattedChallenges,
            pagination: {
                total: totalChallenges,
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalChallenges / limit),
                hasMore: page * limit < totalChallenges
            }
        });

    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Error fetching challenges" });
    }
};

export const getChallengeById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.sub;

        // 1. Fetch Challenge
        // .lean() converts the Mongoose Document to a plain JavaScript object
        // This is required so we can add the 'status' property to it later.
        const challenge = await Challenge.findById(id)
            .select("-testCases.output") // Hide outputs (keep inputs visible if needed for description)
            .lean();

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        // 2. Calculate Status
        let status = "TODO";
        if (userId) {
            const user = await User.findById(userId).select("completedChallenges");

            // Check if this challenge ID exists in the user's completed array
            if (user && user.completedChallenges.some((cId: any) => cId.toString() === id)) {
                status = "SOLVED";
            }
        }

        // 3. Send Combined Response
        // We spread (...) the challenge object and add the status field
        res.status(200).json({
            ...challenge,
            status: status
        });

    } catch (err) {
        console.error("Get Challenge Detail Error:", err);
        res.status(500).json({ message: "Error fetching challenge" });
    }
}


export const generateAIChallenge = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body
        if (!topic) return res.status(400).json({ message: "Topic is required" })

        const generatedData = await generateChallengeWithAI(topic)

        res.status(200).json(generatedData)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "AI Generation Failed" })
    }
}

const HINT_COST = 5
export const getChallengeHint = async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.user?.sub;
        const { id } = req.params; // Challenge ID
        const { code, language } = req.body; // User's current code

        if (!code) {
            return res.status(400).json({ message: "Code is required to generate a hint." })
        }

        const user = await User.findById(userId)
        const challenge = await Challenge.findById(id)

        if (!user || !challenge) {
            return res.status(404).json({ message: "User or Challenge not found" })
        }

        if (user.points < HINT_COST) {
            return res.status(403).json({
                message: `Not enough XP! You need ${HINT_COST} XP to ask for a hint.`,
                currentPoints: user.points
            })
        }

        const hint = await generateHint(
            challenge.title,
            challenge.description,
            code,
            language
        )

        user.points -= HINT_COST
        await user.save()

        // 5. Return Success
        res.json({
            hint,
            remainingPoints: user.points,
            cost: HINT_COST,
            message: `Hint generated! -${HINT_COST} XP`
        })

    } catch (err) {
        console.error("Get Challenge Hint Error:", err)
        res.status(500).json({ message: "Server error while generating hint." })
    }
}

export const getRandomUnsolvedChallenge = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        const user = await User.findById(userId).select("completedChallenges");
        const solvedIds = user?.completedChallenges || [];

        // 1. Try to find an UNSOLVED challenge
        let randomChallenge = await Challenge.aggregate([
            { $match: { _id: { $nin: solvedIds } } },
            { $sample: { size: 1 } }
        ]);

        // 2. Fallback: If they solved everything
        if (!randomChallenge.length) {
            // Pick ANY challenge safely
            const fallback = await Challenge.findOne();

            // Safety check: Database is completely empty?
            if (!fallback) {
                return res.status(404).json({ message: "No challenges in system." });
            }

            // Return with a specific flag 'allSolved: true'
            return res.status(200).json({
                allSolved: true, // <--- Flag for Frontend
                message: "You have solved all available challenges!",
                _id: fallback._id
            });
        }

        // 3. Normal Case
        res.status(200).json({
            allSolved: false,
            _id: randomChallenge[0]._id
        });

    } catch (error) {
        console.error("Random error:", error);
        res.status(500).json({ message: "Server error" });
    }
};