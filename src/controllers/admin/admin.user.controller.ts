import { Request, Response } from "express";
import { User, Role } from "../../models/user.model";

export const getAllUsers = async (req: Request, res: Response) => {
    try{
        // 1. Sanitize & Parse Query Parameters
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        const search = req.query.search as string || "";
        const role = req.query.role as string || "";
        const status = req.query.status as string || ""; // 'active' or 'banned'

        // 2. Build the MongoDB Query Object
        const query: any = {};

        // Search: Case-insensitive regex on Firstname, Lastname, or Email
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: "i" } },
                { lastname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Filters
        if (role && role !== "All") {
            query.roles = role;
        }
        // Assuming you add an 'isActive' boolean or 'status' field to your model later
        if (status && status !== "All") {
            // Example: query.isActive = status === 'active';
        }

        // 3. Pagination Logic
        const skip = (page - 1) * limit;

        // 4. Run Count & Data Fetch in Parallel (Performance Optimization)
        const [users, total] = await Promise.all([
            User.find(query)
                // ⚡ PROJECTION: Only fetch fields the table needs (Saves Bandwidth)
                .select("firstname lastname email roles points avatarUrl createdAt isActive")
                .sort({ createdAt: -1 }) // Newest first
                .skip(skip)
                .limit(limit)
                .lean(), // ⚡ LEAN: Returns plain JSON instead of heavy Mongoose objects (2x-3x Faster)

            User.countDocuments(query)
        ]);

        // 5. Send Standard Response
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }

}

export const toggleUserBan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; // Expect true/false

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: isActive },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: `User ${isActive ? "activated" : "banned"} successfully`,
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update user status" });
    }
}