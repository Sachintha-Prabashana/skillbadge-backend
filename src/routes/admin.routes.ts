import { Router } from "express"
import { Role } from "../models/user.model"
import { authenticate } from "../middleware/auth"
import { requireRole as authorize } from "../middleware/role"
import { createChallenge } from "../controllers/admin/adminChallenge.controller";
import {generateAIChallenge} from "../controllers/challenge.controller";

const adminRouter = Router()

adminRouter.use(authenticate, authorize([Role.ADMIN]))

// Define admin routes here, e.g.:

adminRouter.post(
    "/challenges/create",
    authenticate,
    authorize([Role.ADMIN]),
    createChallenge
)

adminRouter.post("/challenges/generate-ai", generateAIChallenge)

export default adminRouter