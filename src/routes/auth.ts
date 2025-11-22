import { Router } from "express"
import { registerStudent, login, refreshToken } from "../controllers/auth.controller"


const router = Router()

// register (only USER) - public
router.post("/register", registerStudent)
router.post("/login", login)
router.post("/refresh", refreshToken)

export default router