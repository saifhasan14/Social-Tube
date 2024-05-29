// // require('dotenv').config({path: './env'}) // prev versions
import 'dotenv/config'  // es6 version
import connectDB from "./db/index.js";

// import dotenv from "dotenv"

// dotenv.config({
//         path: './env'
// })
    
    
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED !!", err);
}) 

// FOR SENDING REQUEST HOMAPAGE
// import express from "express";
// const app = express();

// app.get( "/", (req, res) => {
//     res.send("hello there");
// })
// app.listen(process.env.PORT)
    

// import mongoose from "mongoose";
// import { DB_NAME } from "./constant.js";

// import express from "express"

// const app = express()

// ;( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("on ERROR: ", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on port:  ${process.env.PORT}`);
//         })
//     }
//     catch(error){
//         console.error("catch ERROR:", error)
//         throw error
//     }
// })()


// function connectDB(){}
// connectDB()
