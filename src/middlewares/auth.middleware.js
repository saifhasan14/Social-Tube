import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async(req, res, next) => {
    // steps
    // use cookie info such as access and refresh token to verify
    // req has access to cookies as we have give in it app.js

    try {
        // when access token not found eg-> mobile then we can check header to get token 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        //                          Authorization: Bearrer <token> -> using replace to remove 'Bearer' keyword

        // if(!token){
        //     console.log("token: ", token);
        //     throw new ApiError(403, "Unauthorized request hai" )
        // }
        // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // see what info it has User where defined
        // // console.log(decodedToken);
    
        // const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
    
        // if(!user){
        //     // discuss about frontend
        //     throw new ApiError(401, "Invalid Access Token" )
        // }
    
        // req.user = user; // very imp step
        // next()

        if(token){
    
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // see what info it has User where defined
            // console.log(decodedToken);
        
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
        
            if(!user){
                // discuss about frontend
                throw new ApiError(401, "Invalid Access Token" )
            }
        
            req.user = user; // very imp step
            next()
        }
        else{
            return res.status(200).json(null)
        }
    } 
    catch (error) {
        throw new ApiError(403, error?.message || "Invalid Access Token")
    }

})