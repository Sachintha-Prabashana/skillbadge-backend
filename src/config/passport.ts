import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL, // Must match Google Console exactly
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user exists (by Google ID or Email)
                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }],
                })

                if (user) {
                    // If user exists via email but hasn't linked Google yet, link it now.
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // 2. If no user found, create a new one
                const newUser = new User({
                    firstname: profile.name?.givenName || "User",
                    lastname: profile.name?.familyName || "",
                    email: profile.emails?.[0].value,
                    googleId: profile.id,
                    avatarUrl: profile.photos?.[0].value || "",
                    roles: ["STUDENT"],
                    points: 0,
                    // Password field is left undefined (Best Practice)
                })

                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false);
            }
        }
    )
)