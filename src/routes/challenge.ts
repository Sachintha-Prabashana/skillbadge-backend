import { Router } from "express"
import { createChallenge } from "../controllers/adminChallenge.controller"
import {getChallengeById, getChallenges, runCode, submitSolution} from "../controllers/challenge.controller"
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

// 2. Single Challenge Detail (Full Info for Solver Page)
// :id acts as a variable (e.g., /challenges/65a...)
challengeRouter.get("/:id", authenticate, getChallengeById);

// 2. Student submits code
challengeRouter.post(
    "/submit", 
    authenticate, 
    submitSolution
)

// POST /api/challenges/run
// Protected route because we don't want bots spamming the compiler
challengeRouter.post("/run", authenticate, runCode);

export default challengeRouter