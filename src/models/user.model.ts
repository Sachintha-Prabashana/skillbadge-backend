import mongoose, { Document, Schema} from "mongoose"

export enum Role {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
}

interface IEducation {
    school: string
    degree: string
    fieldOfStudy: string
    description?: string
}

interface ISocials {
    github?: string
    linkedin?: string
    website?: string
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    firstname?: string
    lastname?: string
    email: string
    password: string
    roles: Role[]
    avatarUrl?: string
    googleId?: string; // <--- ADD THIS
    githubId?: string;

    // --- STATUS FIELD ---
    isActive: boolean; // <--- 1. ADDED TO INTERFACE

    title: string
    about: string
    country: string

    socials: ISocials
    education: IEducation[]

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
    password: { type: String, required: false },
    roles: { type: [String], enum: Object.values(Role), default: [Role.STUDENT] },
    avatarUrl: {
        type: String,
        default: "" // Default to empty string or a placeholder URL
    },
    googleId: { type: String },
    githubId: { type: String },

    isActive: {
        type: Boolean,
        default: true, // Default to true so new signups can login immediately
        index: true    // Optional: Indexes make filtering by "active users" faster
    },

    // --- NEW FIELDS ---
    title: { type: String, default: "" },
    about: { type: String, default: "" },
    country: { type: String, default: "" },

    socials: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        website: { type: String, default: "" },
        twitter: { type: String, default: "" }
    },

    education: [{
        school: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        description: { type: String }
    }],


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