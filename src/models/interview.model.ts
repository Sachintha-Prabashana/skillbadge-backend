import mongoose, {Schema} from "mongoose";

const interviewSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    stream: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
    },
    messages: [
        {
            role: {
                type: String,
                enum: ["system", "user", "assistant"],
                required: true
            },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],

    status: {
        type: String,
        enum: ["ACTIVE", "COMPLETED"],
        default: "ACTIVE"
    }

}, {
    timestamps: true
});

export const Interview = mongoose.model("Interview", interviewSchema);