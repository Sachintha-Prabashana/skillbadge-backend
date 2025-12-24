import { Request, Response } from "express";
import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import {AuthRequest} from "../middleware/auth";
import {io} from "../index";

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

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id).populate("author", "firstname lastname avatarUrl");
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.views += 1;
        await post.save();

        res.json(post);

    } catch (error) {
        res.status(500).json({ message: "Error fetching post" });
    }
}

export const getComments = async (req: Request, res: Response) => {
    try {
        const { id } = req.params // Post ID
        const page = parseInt(req.query.page as string) || 1
        const limit = 20; // load 20 comments per page

        const totalComments = await Comment.countDocuments({ post: id })

        const comments = await Comment.find({ post: id })
            .populate("author", "firstname lastname avatarUrl") // Only fetch needed fields
            .sort({ createdAt: -1 }) // Newest first
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit),
            totalComments
        })

    } catch (error) {
        console.error("Get Comments Error:", error);
        res.status(500).json({ message: "Failed to load comments" });

    }
}

export const addComment = async (req: AuthRequest, res: Response) => {
    try{
        const { id } = req.params // Post ID
        const { content, parentId } = req.body
        const userId = req.user?.sub

        const newComment = await Comment.create({
            post: id,
            author: userId,
            content,
            parentId: parentId || null // If null, it's a main comment
        })

        // B. Populate Author Details (Vital for the UI to show name/avatar immediately)
        await newComment.populate("author", "firstname lastname avatarUrl")

        // C. Update Post Metadata (Optional but recommended)
        // Bumps the post to the top of the feed because of new activity
        await Post.findByIdAndUpdate(id, {
            $inc: { commentCount: 1 }, // Increment cached count
            lastCommentAt: new Date()
        })

        io.to(id).emit("receive_comment", newComment);

        res.status(201).json(newComment);

    } catch(error) {
        console.error("Comment Error:", error)
        res.status(500).json({ message: "Failed to post comment" })
    }
}