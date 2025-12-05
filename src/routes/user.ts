import {  Router } from "express"
import {getLeaderboard, getUserProfile} from "../controllers/user.controller"
import { authenticate } from "../middleware/auth"

const userRouter = Router()

userRouter.get("/leaderboard", authenticate, getLeaderboard)
userRouter.get("/profile/:id", authenticate, getUserProfile)

export default userRouter