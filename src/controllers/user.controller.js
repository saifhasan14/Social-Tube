import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js "
import { User } from "../models/user.model.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler( async(req,res) => {
    // res.status(200).json({
    //     message: "hello saif okay"
    // })

    // get user details from ffrontned
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

export {
    registerUser,
}