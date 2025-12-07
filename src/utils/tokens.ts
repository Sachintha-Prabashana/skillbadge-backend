import { IUser } from "../models/user.model"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const signAccessToken = (user: IUser): string => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            roles: user.roles,
        },
        JWT_SECRET,
        {
            expiresIn: "1h",
        }
    )
}

export const signRefreshToken = (user: IUser): string => {
    return jwt.sign(
        {
            sub: user._id.toString(),
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    )
}

// 2. wrapper Function (Used by Google Auth & Login)
// This creates both tokens in one go
export const generateTokens = (user: IUser) => {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return { accessToken, refreshToken };
}