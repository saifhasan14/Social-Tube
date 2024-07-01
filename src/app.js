import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//sending raw data
app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routers/user.routes.js"
import commentRouter from"./routers/comment.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comment", commentRouter);

// http://localhost:8000/api/v1/users/register

// export default app
export {app}