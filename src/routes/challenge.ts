import { Router } from "express"
import { createChallenge } from "../controllers/adminChallenge.controller"
import {getChallenges, submitSolution} from "../controllers/challenge.controller"
import { authenticate } from "../middleware/auth"
// import { authorize } from "../middleware/authorize"
import { Role } from "../models/user.model"
import { requireRole as authorize } from "../middleware/role"

const challengeRouter = Router();

// 1. Admin creates a challenge
challengeRouter.post(
    "/create", 
    authenticate, 
    authorize([Role.ADMIN]), 
    createChallenge
)

challengeRouter.get("/",authenticate, getChallenges)

// 2. Student submits code
challengeRouter.post(
    "/submit", 
    authenticate, 
    submitSolution
)

export default challengeRouter