import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { User, Role } from "../models/user.model"
import { dot } from "node:test/reporters"

dotenv.config()
const MONGO_URI = process.env.MONGO_URI as string

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log("Connected to DB for seed an admin...")

        const existingAdmin = await User.findOne({
            email: "admin@skillbadge.com"
        })

        if (existingAdmin) {
            console.log("⚠️ Admin user already exists. Skipping.");
            await mongoose.connection.close();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10)
        const adminUser = new User({
            firstname: "Super",
            lastname: "Admin",
            email: "admin@skillbadge.com",
            password: hashedPassword,
            roles: [Role.ADMIN], // <--- FIXED: Must be Role.ADMIN (uppercase)
            points: 9999,        // Optional: Give admin high points for testing
            badges: []
        })

        await adminUser.save()
        console.log("Admin user seeded successfully.")

        // 4. Clean exit
        await mongoose.connection.close();
        process.exit(0);

    }catch (error) {
        console.error("❌ Error seeding admin user:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAdmin()