import mongoose, { Document, Schema } from "mongoose";

export enum SubmissionStatus {
    PASSED = "PASSED",
    FAILED = "FAILED",
    ERROR = "ERROR",
}

export interface ISubmission extends Document {
    user: mongoose.Types.ObjectId;
    challenge: mongoose.Types.ObjectId;
    language: string;
    code: string;
    status: SubmissionStatus;
    passedCases: number;
    totalCases: number;
    pointsEarned: number;
}

const SubmissionSchema = new Schema<ISubmission>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    challenge: {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: { type: String, enum: Object.values(SubmissionStatus), required: true },
    passedCases: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 }
}, { timestamps: true });

export const Submission = mongoose.model<ISubmission>("Submission", SubmissionSchema);