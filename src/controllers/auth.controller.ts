import { Request, Response } from "express"
import { IUser, Role, User } from "../models/user.model"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import crypto, { sign } from "crypto"
import { AuthRequest } from "../middleware/auth"
import { signAccessToken, signRefreshToken } from "../utils/tokens"
import { SendMailUtil } from "../utils/SendMailUtil"


dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const registerStudent = async (req: Request, res: Response) => {
    try{
        const { firstname, lastname, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hash,
            roles: [Role.STUDENT],
        })

        res.status(201).json({
            message: "Student registered successfully",
            data: {
                email: user.email, roles: user.roles
            }
        })
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }

}

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body

        const existingUser = ( await User.findOne({ email })) as IUser | null

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        // 2.  BANNED CHECK
        if (!existingUser.password) {
            return res.status(400).json({
                error_code: "SOCIAL_LOGIN", // <--- Key for Frontend
                provider: "Google",         // (Optional) If you track which provider
                message: "This account uses Google Login. Please sign in with the Google button."
            });
        }

        // 2. Banned Check
        if (existingUser.isActive === false) {
            return res.status(403).json({
                error_code: "ACCOUNT_BANNED",
                message: "Your account has been suspended."
            });
        }

        const valid = await bcrypt.compare(password, existingUser.password)
        if (!valid) {
            return res.status(400).json({ message: "Password mismatch" })
        }

        /////////////////// Generate JWT Token Here ///////////////////

        const accessToken = signAccessToken(existingUser)
        const refreshToken = signRefreshToken(existingUser)


        res.status(200).json({
            message: "Login successful",
            data: {
                email: existingUser.email,
                roles: existingUser.roles,
                // token,
                accessToken,
                refreshToken
            }
        })

    }catch (error) {
        console.error(error)
        res.status(500).json(
            { message: "Internal server error" }
        )
    }
}

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const user = await User.findById(req.user.sub).select("-password")

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  const { email, roles, _id, firstname, lastname, points, avatarUrl } = user as IUser

  res.status(200).json({ message: "ok", data: { id: _id, email, roles, firstname, lastname, points, avatarUrl } })
}

export const refreshToken = async (req: Request, res: Response) => {
    try{
        const { token } = req.body
        if(!token) {
            return res.status(401).json(
                { message: "No token provided" 

                }
            )
        }

        const payload: any = jwt.verify(token, JWT_REFRESH_SECRET)
        const user = await User.findById(payload.sub)
        if(!user) {
            return res.status(401).json(
                { message: "User not found" }
            )
        }

        // --- SECURITY UPGRADE: Token Reuse Detection (Optional but Recommended) ---
        // Ideally, you should check your DB here. 
        // If 'token' is not the one currently saved in user.refreshToken, 
        // it means it was already used/stolen -> Lock the account.
        
        // 3. Issue NEW tokens (Rotation)
        const newAccessToken = signAccessToken(user)
        const newRefreshToken = signRefreshToken(user)


        res.status(200).json({
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        })

    }catch (error) {
        console.error(error)
        res.status(500).json(
            { message: "Internal server error" }
        )
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try{
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            // SECURITY: Standard practice is to send "success" even if email doesn't exist
            // to prevent email enumeration.
            return res.status(200).json({ success: true, data: "Email sent" });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease click the link below to reset your password:\n\n${resetUrl}`;

        try {
            // 👇 USING YOUR NEW CLASS HERE
            await SendMailUtil.send({
                email: user.email,
                subject: "SkillBadge Password Reset",
                message: message,
                // html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>` // Optional HTML
            });

            res.status(200).json({ success: true, data: "Email sent" });

        } catch (err) {
            console.error("Email send failed:", err);
            
            // Clean up database if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: "Email could not be sent" });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });

    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        // 1. Hash the token from URL to match the one in DB
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.resettoken)
            .digest("hex");

        // 2. Find user with valid token AND valid expiration
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // 3. Set new password
        // ⚠️ IMPORTANT: Since you use manual hashing in registerStudent, we do it here too.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // 4. Clear reset fields (Token is single-use)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: "Password updated successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};