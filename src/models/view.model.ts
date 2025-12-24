import mongoose from "mongoose";

const viewSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Null if guest
    ip: { type: String, required: true }, // Track IP for guests
    createdAt: { type: Date, default: Date.now, expires: '24h' } // ⚡ AUTO-DELETE after 24 hours
});

// Compound index ensures a user (or IP) can only have ONE document per post
viewSchema.index({ post: 1, user: 1, ip: 1 }, { unique: true });

export const PostView = mongoose.model("PostView", viewSchema);