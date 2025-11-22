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
    points: number
    badges: mongoose.Types.ObjectId[]
}

const UserSchema = new Schema<IUser>({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.STUDENT] },
    points: { type: Number, default: 0, min: 0 },
    badges: [{ 
        type: Schema.Types.ObjectId,
        ref: "Badge" }],
}, {
    timestamps: true,

})

export const User = mongoose.model<IUser>("User", UserSchema)