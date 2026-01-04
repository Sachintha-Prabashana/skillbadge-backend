import {  Router } from "express"
import {
    getLeaderboard, 
    getMySolvedList, 
    getUserProfile, 
    getUserProgress, 
    updateProfile, 
    uploadProfilePicture 
} from "../controllers/user.controller"
import { authenticate } from "../middleware/auth"
import { upload } from "../middleware/upload";

const userRouter = Router()

userRouter.get("/leaderboard", authenticate, getLeaderboard)
userRouter.get("/profile/:id", authenticate, getUserProfile)
userRouter.put("/avatar", authenticate, upload.single("image"), uploadProfilePicture)
userRouter.put("/me/profile", authenticate, updateProfile)
userRouter.get("/my/lists/solved", authenticate, getMySolvedList)
userRouter.get("/progress", authenticate, getUserProgress);

export default userRouter