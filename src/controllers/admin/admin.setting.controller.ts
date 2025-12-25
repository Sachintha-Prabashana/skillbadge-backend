import { Request, Response } from "express";
import {Role, User} from "../../models/user.model";
import bcrypt from "bcryptjs";
import {AuthRequest} from "../../middleware/auth";

export const createNewAdmin = async (req: Request, res: Response) => {
    try{
        const { firstname, lastname, email, password } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: hashedPassword,
            roles: Role.ADMIN,
            isActive: false, // when previously created admins were active by default
        })

        await newAdmin.save()

        res.status(201).json({
            success: true,
            message: "New Admin created successfully"
        })

    } catch(error){
        res.status(500).json({ message: "Failed to create admin" });

    }
}

export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
    try {
        // Assume req.user._id is populated by your 'protect' middleware
        const userId = req.user.sub;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        // 1. Get user with password included (if you select: false in schema)
        const user = await User.findById(userId).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password!);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // 3. Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to update password" });
    }
}