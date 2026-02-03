import express from "express";
import { startInterview, chatInterview } from "../controllers/interview.controller";
import { authenticate } from "../middleware/auth";

const interviewRoute = express.Router();

// Route to Start (User selects stream here)
interviewRoute.post("/start", authenticate, startInterview);

// Route to Chat (User answers question here)
interviewRoute.post("/chat", authenticate, chatInterview);

export default interviewRoute;