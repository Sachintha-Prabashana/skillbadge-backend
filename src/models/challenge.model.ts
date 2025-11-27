import mongoose, { Document, Schema} from "mongoose"

export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
}

// 1.Define specific code templates per language
interface IStarterCode {
    language: string // e.g. "javascript", "python"
    code: string    // e.g. "function solve(input) { ... }"
}

// 2. Define the input/output test case structure
interface ITestCase {
    input: string
    output: string
    isHidden: boolean // If true, user sees "Hidden Test Case" if they fail
}

export interface IChallenge extends Document {
  title: string;
  description: string; // The main problem text
  tips: string[];      // Hints for students
  difficulty: Difficulty;
  points: number;
  
  // Configuration
  allowedLanguages: string[]; // ["python", "javascript"]
  starterCode: IStarterCode[];
  testCases: ITestCase[];
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tips: [{ type: String }], 
    difficulty: { type: String, enum: Object.values(Difficulty), default: Difficulty.EASY },
    points: { type: Number, default: 10 },
    
    allowedLanguages: [{ type: String, required: true }],
    
    starterCode: [{
      language: { type: String, required: true },
      code: { type: String, required: true }
    }],

    testCases: [{
      input: { type: String, required: true },
      output: { type: String, required: true }, // The expected stdout
      isHidden: { type: Boolean, default: true }
    }]
  },
  { timestamps: true }
);

export const Challenge = mongoose.model<IChallenge>("Challenge", ChallengeSchema);
