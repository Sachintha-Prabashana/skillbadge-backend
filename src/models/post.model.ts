import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // Stores Markdown
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    category: {
        type: String,
        enum: ["Interview Experience", "Solutions", "Compensation", "General"],
        default: "General"
    },
    tags: [{ type: String }], // e.g., ["Google", "DP"]

    // Stats
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who voted
    views: { type: Number, default: 0 },

    // For sorting
    lastCommentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtual field for vote count (so we don't store a number manually)
postSchema.virtual("voteCount").get(function() {
    return this.upvotes.length;
});

export const Post = mongoose.model("Post", postSchema);