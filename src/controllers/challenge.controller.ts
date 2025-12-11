import { Request, Response } from "express"
import { Challenge } from "../models/challenge.model"
import { User } from "../models/user.model"
import { AuthRequest } from "../middleware/auth"
import { executeCode } from "../utils/piston"
import {generateChallengeWithAI} from "../utils/ai";
import {generateHint} from "../service/ai.service";

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

        // 1. Pagination Setup
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // 2. Fetch User Progress
        const user = await User.findById(userId).select("completedChallenges");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const solvedSet = new Set(
            user.completedChallenges.map((id) => id.toString())
        );

        // 3. Get Total Count (Required for "Page X of Y" UI)
        const totalChallenges = await Challenge.countDocuments();

        // 4. Fetch The Actual Data (Paginated)
        const challenges = await Challenge.find()
            .select("title difficulty points allowedLanguages createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)   // <--- THIS WAS MISSING
            .limit(limit) // <--- THIS WAS MISSING
            .lean();      // <--- Best practice for read-only lists

        // 5. Merge Data
        const formattedChallenges = challenges.map((challenge) => ({
            _id: challenge._id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            points: challenge.points,
            // Fallback to first language or 'General' if you don't have tags
            category: challenge.allowedLanguages?.[0] || "General",
            status: solvedSet.has(challenge._id.toString()) ? "SOLVED" : "TODO"
        }));

        // 6. Return Data + Pagination Info
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

export const getChallengeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const challenge = await Challenge.findById(id)
            // 2. SELECT SPECIFIC FIELDS
            // - We NEED: description (markdown), starterCode (for editor)
            // - We HIDE: testCases (answers). We only send test cases during the 'Run' phase or if they are public examples.
            .select("-testCases.output -testCases.isHidden")

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        res.status(200).json(challenge)

    }catch(err){
        console.error("Get Challenge Detail Error:", err)
        res.status(500).json({ message: "Error fetching challenge" })
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