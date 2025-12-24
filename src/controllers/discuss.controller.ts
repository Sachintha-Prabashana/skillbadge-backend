import { Request, Response } from "express";
import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import {AuthRequest} from "../middleware/auth";

// 1. GET FEED (With Filters & Search)
export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, search, tag, page = 1 } = req.query;
        const limit = 10;

        // Build Query Object
        const query: any = {};

        // Filter by Category
        if (category && category !== "All") {
            query.category = category;
        }

        // Filter by Search (Title or Content)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by Tag Click
        if (tag) {
            query.tags = tag;
        }

        // Fetch Posts
        const posts = await Post.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .skip((Number(page) - 1) * limit)
            .limit(limit)
            .populate("author", "firstname lastname avatarUrl"); // Get author details

        // Get Comment Counts for these posts
        // We do this efficiently by mapping
        const postsWithCounts = await Promise.all(posts.map(async (p) => {
            const commentCount = await Comment.countDocuments({ post: p._id });
            return {
                ...p.toObject(),
                voteCount: p.upvotes.length, // Calculate virtual manually for JSON
                commentCount,
                // Simple "Hot" logic: > 10 votes is hot
                isHot: p.upvotes.length > 10
            };
        }));

        res.json(postsWithCounts);

    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
};

// 2. CREATE POST
export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, category, tags } = req.body;

        const newPost = await Post.create({
            title,
            content,
            category,
            tags, // e.g., "Google, Array" -> ["Google", "Array"]
            author: req.user?.sub
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to create post" });
    }
};

// 3. TOGGLE UPVOTE
export const toggleVote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Post ID
        const userId = req.user?.sub;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check if already voted
        const index = post.upvotes.indexOf(userId as any);

        if (index === -1) {
            post.upvotes.push(userId as any); // Add Vote
        } else {
            post.upvotes.splice(index, 1); // Remove Vote (Toggle)
        }

        await post.save();
        res.json({ upvotes: post.upvotes.length });

    } catch (error) {
        res.status(500).json({ message: "Vote failed" });
    }
};