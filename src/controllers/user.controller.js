import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js ";
import { User } from "../models/user.model.js";
import {deleteOnCloudinary, uploadOnCLoudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ValidityBeforeState: false}) 

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh token")        
    }
}

const registerUser = asyncHandler( async(req,res) => {
    // res.status(200).json({
    //     message: "hello saif okay"
    // })

    // get user details from frontned
    // validation - not empty
    // check if user already exist: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // check uploded on clodinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);
    // console.log("req.body: ", req.body);
    
    // if(fullName === ""){
    //     throw new ApiError(400, "full name is required")
    // }
    // advance syntax for not writing multilpe if condn

    if(
        [fullName, email, username, password].some( (field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All feilds are required")
    }

    const existedUser = await User.findOne({
        // for checking multiple fields at once or use => User.findOne(username)
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username already exist")
    }

    // console.log("req.files: ", req.files);
    // console.log("req.files.avatar: ", req.files.avatar);

    // gives error
    // const avatartLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatartLocalPath;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatartLocalPath = req.files.avatar[0].path
    }

    //wrong
    // if(req.files && req.files.coverImage && req.files.coverImage[0]){
    //     coverImageLocalPath = req.files?.coverImage[0]?.path;
    // }
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatartLocalPath){
        throw new ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCLoudinary(avatartLocalPath)
    const coverImage = await uploadOnCLoudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar:{
            url: avatar.url,
            public_id: avatar.public_id 
        },
        coverImage:{
            url: coverImage?.url || "",
            public_id: coverImage?.public_id || ""
        },
        email,
        password,
        username: username.toLowerCase()
    })
    // console.log("user: ",user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    ) // to deselect thses field

    if(!createdUser){
        throw new ApiError(500, "something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

})

const loginUser = asyncHandler( async(req, res) => {
    // steps involved
    // take input from user -> req.body
    // check for username and email exist or not
    // find the user
    // check for password
    // access and refresh token
    // send cookie

    const { email, username, password} = req.body

    if(!username && !email ){
        throw new ApiError(400, "username or email is required")
    }
    
    // finding user if any of two feilds available
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    // now check password 
    const isPassswordValid = await user.isPassswordCorrect(password)

    if(!isPassswordValid){
        throw new ApiError(401, "Incorect password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    // you can also update it by user saving one database call
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = { // only modifies by server hence secure
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in successfully"
        )
    )

}) 

const logoutUser = asyncHandler( async(req, res) => {
    // steps invloved
    // we need to find user first and we can send a form to user to fill
    // so we will use/design middleware to find wheather a user is logged in orr not / or has access

    // now we have used auth middleware -> verfiyJWT
    // since we are here we must have pass verifyjwt so have set (req.user = user)
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
            // $set: {
            //     refreshToken: undefined
            // }
        },
        {
            new: true
        }
    )

    const options = { // only modifies by server hence secure
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User Logged OUt"
    ))


})

const refreshAccessToken = asyncHandler( async(req,res) => {

    try {
        const incomingRefreshToken = req.cookies.refreshToken ||  req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unathorized Request")
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user  = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh token")
        }
    
        if( incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401, "Refresh Token is expired or Used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await
        generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                "Access Token Refresh Suceesfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token" )
    }

})

const changeCurrentPassword = asyncHandler( async(res,req) => {
    const {oldPassword, newPassword} = req.body

    // const {oldPassowrd, newPassword, confPassword} = req.body
    // if(!(newPassword === confPassword)){
    //     throw new ApiError(400, "Password doesn't matched")
    // }

    // since we are coming from middleware req.user has id
    const user = await User.findById(req.user?._id)

    const checkPassswordCorrect = await user.isPassswordCorrect(oldPassword)

    if(!checkPassswordCorrect){
        throw new ApiError(400, "invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse( 200, {}, "Password Changes Succesfully")
    )


})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current User fetched successfully")
    )
})

const updateUserDetail = asyncHandler( async(req, res) => {
    const{fullName, email} = req.body

    if(!fullName && !email){
        throw new ApiError(400, "At least one feild is required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json( new ApiResponse(200, user, "Account Details Updated Successfully"))

})

const updateUserAvatar = asyncHandler( async(req,res) => {
    const avatartLocalPath = req.file?.path

    if(!avatartLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    const avatar = await uploadOnCLoudinary(avatartLocalPath)

    if(!avatar?.url){
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }

    const user = await User.findById(req.user._id).select("avatar")
    const avatarToDelete = user.avatar?.public_id;

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: {
                    url: avatar.url,
                    public_id: avatar.public_id
                }
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    if(!updatedUser.avatar.public_id){
        throw new ApiError(500, "avatar updation failed")
    }

    // for deleting on cloudinary
    if (avatarToDelete ) {
        await deleteOnCloudinary(avatarToDelete);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedUser,"Avatar Image Uploaded Successfully")
    )

})

const updateUserCoverImage = asyncHandler( async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }
    
    const coverImage = await uploadOnCLoudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image on cloudinary")
    }

    const user = await User.findById(req.user?._id).select("coverImage")
    const coverImageToDelete = user.coverImage.public_id

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: {
                    url: coverImage.url,
                    public_id: coverImage.public_id
                }
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    if(!updatedUser.coverImage.public_id){
        throw new ApiError(500, "coverImage updation failed")
    }

    // for deleting on cloudinary
    if (coverImageToDelete ) {
        await deleteOnCloudinary(coverImageToDelete);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedUser,"Cover Image Uploaded Successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    // User.find({username}) can be done
    
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", // The collection to join with
                localField: "_id", // Field from the current collection (User) to match
                foreignField: "channel", // Field from the 'subscriptions' collection to match
                as: "subscribers" // Alias for the joined data
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber" ]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    // console.log("channel info:", channel);

    if(!channel?.length){
        throw new ApiError(404, "channel doesnot exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            //  channel is array with one object in it 
            channel[0], 
            "User channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler( async(req, res) => {
    
    const user = await User.aggregate([
        {
            // find the current user
            $match: {
                // _id: req.user._id  its wrong becuz ye direct jata hai without mongoose
                _id: new mongoose.Types.ObjectId(req.user._id) // as userre.user._id give string
            },
        },
        {
            // we will update watch history by its video detail aong with owner details
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory", // it will override the previous one
                // as: "myWatchHistory", it will create new feild along with "watchHistory"

                // sub-pipeline for owner field
                pipeline: [ 
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner", // override previous owner feild
                            // as: "newowner", // create new field

                            //sub-pipeline for project of limited information from owner
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        "avatar.url": 1
                                        // avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    // as of now we have array with name owner
                    {
                        // !!! without this all code will run
                        $addFields: {
                            //overwriting existing feild owner so that it has information 
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    if(!user?.length){
        throw new ApiError(404, "History not fetched" )
    }

    console.log("user history: ", user);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            // print full user along with everything and it is array with one object in it
            // user, 
            user[0].watchHistory, 
            "fetched User Watch History Successfully"
        )
    )

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}