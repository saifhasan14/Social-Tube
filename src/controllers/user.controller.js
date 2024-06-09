import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js ";
import { User } from "../models/user.model.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    console.log("user: ",user);

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
        new ApiResponse(200, req.user, "Current User fetched succeesfully")
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

    if(avatartLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    const avatar = await uploadOnCLoudinary(avatartLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avtar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar Image Uploaded Successfully")
    )

})
const updateUserCoverImage = asyncHandler( async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }
    
    const coverImage = await uploadOnCLoudinary(coverImageLocalPath)

    if(!coverImageLocalPath.url){
        throw new ApiError(400, "Error while uploading cover image on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image Uploaded Successfully")
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
    updateUserCoverImage
}