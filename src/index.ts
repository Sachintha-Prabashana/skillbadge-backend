import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io'
import authRouter from "./routes/auth"
import challengeRouter from './routes/challenge';
import userRouter from "./routes/user";
import passport from "passport";

// 👇 IMPORTANT: You MUST import the config file here so the code inside it runs!
import "./config/passport";
import adminRouter from "./routes/admin.routes";
import discussRouter from "./routes/discuss";
import interviewRoute from "./routes/interview";


dotenv.config();

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()

app.use(express.json())
app.use(
    cors({
        origin: ["http://localhost:5173", 
          "https://skillbadge-frontend.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    })
    
)

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173",
          "https://skillbadge-frontend.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Room Logic: Users join a "room" based on the Post ID they are viewing
    socket.on("join_post", (postId) => {
        socket.join(postId);
        console.log(`User ${socket.id} joined discussion: ${postId}`);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })
})


app.use(passport.initialize())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/challenges", challengeRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/discuss", discussRouter)
app.use("/api/v1/interview", interviewRoute)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
