import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'

import authRouter from "./routes/auth"
import challengeRouter from './routes/challenge';
import userRouter from "./routes/user";

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

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/challenges", challengeRouter)
app.use("/api/v1/users", userRouter)

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
