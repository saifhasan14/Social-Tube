import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(`\n mongo DB connected !! DB HOST: ${connectionInstance}`);
        // console.log(`\n mongo DB connected !! DB HOST: ${connectionInstance.connection.host }`);
        console.log(`running on port ${process.env.PORT}`);
    }
    catch(error){
        console.log("MONGO DB connection error: ", error);
        process.exit(1)
    }
}

export default connectDB