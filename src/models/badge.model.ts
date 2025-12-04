import mongoose, { Document, Schema} from "mongoose"

export enum BadgeCriteria {
    POINTS = "POINTS",
    SOLVED_TOTAL = "SOLVED_TOTAL",
    STREAK = "STREAK",
}

export interface IBadge extends Document {
    _id: mongoose.Types.ObjectId;
    name: string
    description: string
    icon: string
    color: string
    criteriaType: BadgeCriteria
    criteriaValue: number
}

const BadgeSchema = new Schema<IBadge>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: "text-yellow-500" },
    criteriaType: { type: String, enum: Object.values(BadgeCriteria), required: true },
    criteriaValue: { type: Number, required: true },
}, {
    timestamps: true

})

export const Badge = mongoose.model<IBadge>("Badge", BadgeSchema)