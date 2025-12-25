import { Router } from "express"
import { Role } from "../models/user.model"
import { authenticate } from "../middleware/auth"
import { requireRole as authorize } from "../middleware/role"
import {
    createChallenge,
    getAllChallenges

    }
from "../controllers/admin/admin.Challenge.controller";
import { generateAIChallenge } from "../controllers/challenge.controller";
import { getDashboardStats } from "../controllers/admin/admin.dashboard.controller";
import {getAllUsers, toggleUserBan} from "../controllers/admin/admin.user.controller";

const adminRouter = Router()

adminRouter.use(authenticate, authorize([Role.ADMIN]))


// Define admin routes here, e.g.:
adminRouter.get("/challenges", getAllChallenges)
adminRouter.post(
    "/challenges/create",
    authenticate,
    authorize([Role.ADMIN]),
    createChallenge
)

adminRouter.post("/challenges/generate-ai", generateAIChallenge)


adminRouter.get("/stats", getDashboardStats)

adminRouter.get("/users",  getAllUsers)
adminRouter.patch("/users/:id/ban", toggleUserBan)

export default adminRouter