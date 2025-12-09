import { Router } from "express"
import { createChallenge } from "../controllers/adminChallenge.controller"
import {
    generateAIChallenge,
    getChallengeById, getChallengeHint,
    getChallenges,
    submitSolution
} from "../controllers/challenge.controller"
import { authenticate } from "../middleware/auth"
import { Role } from "../models/user.model"
import { requireRole as authorize } from "../middleware/role"
import {runCode} from "../controllers/submission.controller";

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

challengeRouter.post("/generate-ai", authenticate, authorize([Role.ADMIN]), generateAIChallenge)

// POST /api/challenges/run
// Protected route because we don't want bots spamming the compiler
challengeRouter.post("/run", authenticate, runCode)

challengeRouter.post("/:id/hint", authenticate, getChallengeHint)

export default challengeRouter