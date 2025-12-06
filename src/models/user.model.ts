import mongoose, { Document, Schema} from "mongoose"

export enum Role {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    firstname?: string
    lastname?: string
    email: string
    password: string
    roles: Role[]
    avatarUrl?: string
    points: number
    badges: mongoose.Types.ObjectId[]
    completedChallenges: mongoose.Types.ObjectId[] // Track solved problems

    currentStreak: number
    longestStreak: number // Optional: good for "Personal Best"
    lastSolvedDate?: Date  // To calculate if streak continues or resets
}

const UserSchema = new Schema<IUser>({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.STUDENT] },
    avatarUrl: {
        type: String,
        default: "" // Default to empty string or a placeholder URL
    },
    points: { type: Number, default: 0, min: 0 },
    badges: [{ 
        type: Schema.Types.ObjectId,
        ref: "Badge" }],

    // --- 2. Solved Challenges (Optimization) ---
    // This allows you to check "Is Solved?" in O(1) time on the dashboard
    completedChallenges: [{
        type: Schema.Types.ObjectId,
        ref: "Challenge"
    }],

    // --- STREAK LOGIC FIELDS ---
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date } // Nullable initially

}, {
    timestamps: true,

})

export const User = mongoose.model<IUser>("User", UserSchema)