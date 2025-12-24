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
};