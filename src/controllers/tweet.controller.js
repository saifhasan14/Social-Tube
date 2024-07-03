import mongoose, { isValidObjectId, mongo } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// create tweet
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "content feild is required")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner: req.user?._id
        }
    )

    if (!tweet) {
        throw new ApiError(500, "failed to create tweet please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
})

// TODO: get user tweets
// const getUserTweets = asyncHandler(async (req, res) => {

//     const { userId } = req.params;

//     if (!isValidObjectId(userId)) {
//         throw new ApiError(400, "Invalid userId");
//     }

//     // Fetch user details once using $lookup and store in a variable
//     const userLookupPipeline = [
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "ownerDetails",
//             },
//         },
//         {
//             $unwind: "$ownerDetails"
//         },
//         {
//             $project: {
//                 "ownerDetails.fullName": 1,
//                 "ownerDetails.username": 1,
//                 "ownerDetails.avatar.url": 1,
//             },
//         }
//     ];

//     const userTweets = await Tweet.aggregate([
//         {
//             $match: {
//                 owner: new mongoose.Types.ObjectId(userId)
//             }
//         },
//         // here we are looking for the user repeateadily for every tweet which can be optimised
//         // {
//         //     $lookup: {
//         //         from: "users",
//         //         localField: "owner",
//         //         foreignField: "_id",
//         //         as: "ownerDetails",
//         //         pipeline: [
//         //             {
//         //                 $project: {
//         //                     fullName: 1,
//         //                     username: 1,
//         //                     "avatar.url": 1,
//         //                 },
//         //             },
//         //         ],
//         //     },
//         // },
//         // {
//         //     $unwind: "$ownerDetails"
//         // },

//         //Includes userLookupPipeline using the spread operator (...) to integrate user details fetched earlier (ownerDetails) into the aggregation pipeline. This avoids redundant user queries for each tweet.

//         ...userLookupPipeline,
//         {
//             $lookup: {
//                 from: "likes",
//                 localField: "_id", // tweet id
//                 foreignField: "tweet",
//                 as: "likes"
//             },
//         },
//         {
//             $addFields: {
//                 totalLikes: {
//                     $size: "likes"
//                 },
//                 isliked: {
//                     $cond: {
//                         if: {
//                             $in: [req.user?._id, "$likes.likedBy"]
//                         },
//                         then: true,
//                         else: false
//                     }
//                 }
//             }
//         },
//         {
//             $sort: {
//                 createdAt: -1
//             }
//         },
//         {
//             $project: {
//                 content: 1,
//                 ownerDetails: 1,
//                 likesCount: 1,
//                 isLiked: 1,
//                 createdAt: 1,
//             },
//         },
//     ])

//     if(!userTweets){
//         throw new ApiError(500, "tweets not fetched try again !!")
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"));
// })

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

// update tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        }
    )

    if (!updateTweet) {
        throw new ApiError(500, "Failed to edit tweet please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));

})

// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete thier tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {tweetId}, "Tweet deleted successfully"));
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
