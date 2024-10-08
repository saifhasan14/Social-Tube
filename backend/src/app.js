import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";


const app = express()

// const allowedOrigins = ['http://192.168.29.129:5173', 'http://localhost:5173'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

app.use(cors({
    // origin: "http://localhost:5173",
    origin: "https://social-tube.vercel.app",
    credentials: true
}))

//sending raw data
app.use(express.json({limit: "16mb"}))

app.use(express.urlencoded({extended: true, limit: "16mb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(morgan("dev")); //HTTP request logger middleware for node.js 

app.get("/api/v1/test", (req, res) => {
    res.status(200).json({message : "backend is working"})
})

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from"./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import ratingRouter from "./routes/rating.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/rating", ratingRouter)

// http://localhost:8000/api/v1/users/register

// export default app
export {app}