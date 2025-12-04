import mongoose from "mongoose"
import dotenv from "dotenv"
import { Badge} from "../models/badge.model"
import { BADGE_MANIFEST} from "../config/seeds/badgeManifest"

dotenv.config()

const seedBadges = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("MongoDB is missing")

        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected")

        for (const badgeData of BADGE_MANIFEST) {
            // Upsert: Update if exists, Create if new
            await Badge.findOneAndUpdate(
                { name: badgeData.name },
                badgeData,
                { upsert: true, new: true }
            );
            console.log(`Synced: ${badgeData.name}`)
        }
        console.log("Badges seeded successfully!")
        process.exit(0)

    } catch (error) {
        console.error("Error seeding badges:", error)
        process.exit(1)
    }
}
// Execute
seedBadges();