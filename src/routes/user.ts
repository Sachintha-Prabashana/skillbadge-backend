import {  Router } from "express"
import {getLeaderboard, getUserProfile, uploadProfilePicture} from "../controllers/user.controller"
import { authenticate } from "../middleware/auth"
import {upload} from "../middleware/upload";

const userRouter = Router()

userRouter.get("/leaderboard", authenticate, getLeaderboard)
userRouter.get("/profile/:id", authenticate, getUserProfile)
userRouter.put("/avatar", authenticate, upload.single("image"), uploadProfilePicture)

export default userRouter