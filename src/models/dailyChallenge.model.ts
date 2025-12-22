import mongoose, { Document, Schema } from "mongoose"

export interface  IDailyChallenge extends Document {
    date: string  // Format: "2025-12-20" (Simple string prevents timezone headaches)
    challenge: mongoose.Types.ObjectId
}

const DailyChallengeSchema = new Schema<IDailyChallenge>({
    date: {
        type: String,
        required: true,
        unique: true, // Ensure one challenge per day
        index: true
    },
    challenge: {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    }
}, {
    timestamps: true
})

export const DailyChallenge = mongoose.model<IDailyChallenge>("DailyChallenge", DailyChallengeSchema)