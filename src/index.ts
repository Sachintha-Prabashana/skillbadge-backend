import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'

import authRouter from "./routes/auth"
import challengeRouter from './routes/challenge';
import userRouter from "./routes/user";
import passport from "passport";

// 👇 IMPORTANT: You MUST import the config file here so the code inside it runs!
import "./config/passport";
import adminRouter from "./routes/admin.routes";
import discussRouter from "./routes/discuss";


dotenv.config();

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()

app.use(express.json())
app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],

    })
    
)

app.use(passport.initialize())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/challenges", challengeRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/discuss", discussRouter)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

app.listen(PORT, () => {
  console.log("Server is running")
})
