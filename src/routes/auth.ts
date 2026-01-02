import { Router } from "express"
import { registerStudent, login, refreshToken, getMyProfile } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"
import passport from "passport";
import {generateTokens} from "../utils/tokens";
import { get } from "http";


const router = Router()

// register (only USER) - public
router.post("/register", registerStudent)
router.post("/login", login)
router.get("/me", authenticate, getMyProfile)
router.post("/refresh", refreshToken)

const getClientUrl = () => {
    return process.env.CLIENT_URL;
};

// --- 1. Start Login Flow ---
// Frontend redirects here -> Server redirects to Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// --- 2. Google Callback ---
// Google redirects back here with code -> Server creates tokens -> Redirects to Frontend
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        // If execution reaches here, user is successfully authenticated
        const user: any = req.user;

        // Generate JWTs using your existing helper
        // Assuming your generateTokens returns { accessToken, refreshToken }
        const { accessToken, refreshToken } = generateTokens(user);

        res.redirect(`${getClientUrl()}/auth-success?token=${accessToken}&refresh=${refreshToken}`);
    }
)

// 1. Start GitHub Login
router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] })
)

// 2. GitHub Callback
router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        // User is logged in
        const user: any = req.user;

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.redirect(`${getClientUrl()}/auth-success?token=${accessToken}&refresh=${refreshToken}`);
    }
)

export default router