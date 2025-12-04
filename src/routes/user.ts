import {  Router } from "express"
import { getLeaderboard} from "../controllers/user.controller"
import { authenticate } from "../middleware/auth"

const userRouter = Router()

userRouter.get("/leaderboard", authenticate, getLeaderboard)

export default userRouter