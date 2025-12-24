import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as DiscussController from "../controllers/discuss.controller";

const discussRouter = Router();

// Public Routes (Viewing)
discussRouter.get("/", DiscussController.getPosts);

// Protected Routes (Creating & Voting)
discussRouter.use(authenticate);
discussRouter.post("/", DiscussController.createPost);
discussRouter.put("/:id/vote", DiscussController.toggleVote);

export default discussRouter;