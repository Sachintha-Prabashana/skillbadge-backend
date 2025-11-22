import { Request, Response } from "express"
import { IUser, Role, User } from "../models/user.model"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { sign } from "crypto"
import { signAccessToken, signRefreshToken } from "../utils/tokens"


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

        const valid = await bcrypt.compare(password, existingUser.password)
        if (!valid) {
            return res.status(400).json({ message: "Invalid email or password" })
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
                { message: "Invalid refresh token" }
            )
        }

        const accessToken = signAccessToken(user)

        res.status(200).json({
            message: "Token refreshed successfully",
            data: {
                accessToken
            }
        })

    }catch (error) {
        console.error(error)
        res.status(500).json(
            { message: "Internal server error" }
        )
    }
}