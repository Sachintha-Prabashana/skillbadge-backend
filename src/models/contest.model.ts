import mongoose from "mongoose"

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // The 4 Specific Problems
    challenges: [{
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
        points: { type: Number, required: true }, // e.g., 10, 20, 30, 40
        order: { type: Number, default: 1 } // Q1, Q2, Q3, Q4
    }],

    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

}, {
    timestamps: true
})

export const Contest = mongoose.model("Contest", contestSchema)