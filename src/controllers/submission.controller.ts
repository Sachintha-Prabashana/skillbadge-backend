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
};