import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const currentCheck = asyncHandler( async(req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(token){
        next();
    }
    else{
        return res
        .status(200)
        .json(
            new ApiResponse(200, {haveToken: false}, "Current User fetched successfully but does not have token ")
        )
    }
}) 