import { Request, Response } from "express"
import { Challenge } from "../models/challenge.model"
import { User } from "../models/user.model"
import { AuthRequest } from "../middleware/auth"
import { executeCode } from "../utils/piston"

export const submitSolution = async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user?.sub; // Assumes you extracted this from JWT

    // 1. Get Challenge Data
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // 2. Check if language is allowed for this specific challenge
    if (!challenge.allowedLanguages.includes(language)) {
        return res.status(400).json({ message: `Language ${language} not allowed for this challenge` });
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
           $inc: { points: challenge.points },
           $addToSet: { completedChallenges: challengeId }
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
    res.status(500).json({ message: "Error executing code solution" });
  }
}

export const getChallenges = async (req: AuthRequest, res: Response) => {
    try{

        const userId = req.user?.sub; // Get logged-in user ID
        // 1. Fetch the user to see what they have completed
        // We only need the 'completedChallenges' array
        const user = await User.findById(userId).select("completedChallenges")

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Create a "Set" for O(1) instant lookup
        // Turning [id1, id2, id3] into a Set makes checking "has(id)" extremely fast
        const solvedSet = new Set(
            user.completedChallenges.map((id) => id.toString())
        );

        // 4. Fetch the Challenge List
        // Optimization: Exclude heavy fields (testCases, starterCode, description)
        // We only fetch what the UI card needs.
        const challenges = await Challenge.find().select("title difficulty points createdAt")
            .sort({ createdAt: -1 })

        // 5. Merge Data (The Magic Step)
        // We loop through challenges and add the "status" field dynamically
        const formattedChallenges = challenges.map((challenge) => ({
            _id: challenge._id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            points: challenge.points,
            // category: challenge.allowedLanguages?.[0] || "General", // or use tags if you added them

            // CHECK: Is this challenge ID in the user's solved list?
            status: solvedSet.has(challenge._id.toString()) ? "SOLVED" : "TODO"
        }))

        res.status(200).json(formattedChallenges);


    }catch(err){
        res.status(500).json({ message: "Error fetching challenges" });
    }
}

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

export const runCode = async (req: Request, res: Response) => {
    try {
        const {
            challengeId,
            code,
            language
        } = req.body

        // 1. Fetch the Challenge (Include 'testCases' this time!)
        const challenge = await Challenge.findById(challengeId)

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        const results = []
        let allPassed = true

        // 3. Loop through EVERY test case
        for (const testCase of challenge.testCases) {

            // A. Run code on Piston
            const pistonRes = await executeCode(language, code, testCase.input);

            // B. Get Output (Handle potential errors)
            const actualOutput = pistonRes.run.stdout ? pistonRes.run.stdout.trim() : "";
            const errorOutput = pistonRes.run.stderr;
            const expectedOutput = testCase.output.trim();

            // C. Compare (The Grading Logic)
            // If there is an error (stderr), it's automatically a fail
            const isCorrect = !errorOutput && (actualOutput === expectedOutput);

            if (!isCorrect) allPassed = false;

            // D. Add to result list
            results.push({
                input: testCase.input,
                expectedOutput: testCase.output, // Send back so user knows what failed
                actualOutput: errorOutput || actualOutput, // Show error if crash, else stdout
                passed: isCorrect,
                isHidden: testCase.isHidden // Frontend can use this to hide data if needed
            });
        }

        // 4. Send Result
        res.status(200).json({
            status: allPassed ? "PASSED" : "FAILED",
            results
        });

    } catch (error: any) {
        console.error("Execution Error:", error.message);
        res.status(500).json({ message: "Error executing code" });
    }
}