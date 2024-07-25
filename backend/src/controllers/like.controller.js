import mongoose, {isValidObjectId} from "mongoose"
import { Like } from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const previouslyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if(previouslyLiked){
        await Like.findByIdAndDelete(previouslyLiked?._id)

        return res
                .status(200)
                .json(new ApiResponse(200, {isLiked: false}, "video unliked successfully "))
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json( new ApiResponse(200, { isLiked: true }, "video liked succesfully"))

})

// toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const previouslyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(previouslyLiked){
        await Like.findByIdAndDelete(previouslyLiked?._id)

        return res
                .status(200)
                .json(new ApiResponse(200, {isLiked: false}, "comment unliked successfully "))
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json( new ApiResponse(200, { isLiked: true }, "comment liked succesfully"))


})

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }


    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, { tweetId, isLiked: false }, "tweet unliked sucesfully"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "tweet liked successfully"));
})

//TODO: get all liked videos -> 
const getLikedVideos = asyncHandler(async (req, res) => {
    
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",

                pipeline: [
                    {
                        // we are in the video model now
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        "avatar.url": 1
                                    }
                                }
                            ]
                        }
                    },
                    // use unwind so that the owner feild is object and not an array
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideo"
        },
        {
            $sort:{
                createAt: -1
            }
        },
        // {
        //     $addFields: {
        //         likedVideos: {
        //             $first: "$likedVideos"
        //         }
        //     }
        // },
        {
            $project: {
                _id: 0, // of like model
                likedVideo: {
                    _id: 1, // of video model
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: 1,
                    // ownerDetails: {
                    //     username: 1,
                    //     fullName: 1,
                    //     "avatar.url": 1,
                    // },
                }
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideosAggegate, "liked videos fetched successfully" ))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}