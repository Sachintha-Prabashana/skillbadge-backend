import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
    getPosts,
    createPost,
    toggleVote,
    getComments,
    addComment,
    getPostById
} from "../controllers/discuss.controller";

const discussRouter = Router();

// Public Routes (Viewing)
discussRouter.get("/", getPosts);
discussRouter.get("/:id", getPostById)

// Protected Routes (Creating & Voting)
discussRouter.use(authenticate);
discussRouter.post("/", createPost);
discussRouter.put("/:id/vote", toggleVote);
discussRouter.get("/:id/comments", getComments)
discussRouter.post("/:id/comments", authenticate, addComment)


export default discussRouter;