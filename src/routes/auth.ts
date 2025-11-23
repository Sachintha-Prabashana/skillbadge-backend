import { Router } from "express"
import { registerStudent, login, refreshToken, getMyProfile } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"


const router = Router()

// register (only USER) - public
router.post("/register", registerStudent)
router.post("/login", login)
router.get("/me", authenticate, getMyProfile)
router.post("/refresh", refreshToken)

export default router