import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

//     This method directly counts the number of documents in the collection that match the given query.
//      It's more efficient than using an aggregation pipeline for simple counting operations.
    const totalSubscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(userId)
    });

    // using $count
    // const totalSubscribers = await Subscription.aggregate([
    //     {
    //         $match: {
    //             channel: new mongoose.Types.ObjectId(userId)
    //         }
    //     },
    //     {
    //         $count: "subscribersCount"
    //     }
    // ]);
    // const subscribersCount = totalSubscribers.length > 0 ? totalSubscribers[0].subscribersCount : 0;

// using $group to count
    // const totalSubscribers = await Subscription.aggregate([
    //     {
    //         $match: {
    //             channel: new mongoose.Types.ObjectId(userId)
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: null,
    //             subscribersCount: {
    //                 $sum: 1
    //             }
    //         }
    //     }
    // ]);

    const videoStats = Video.aggregate([
        {
            $match:  {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        // $project stage calculates totalLikes (number of likes for each video), retains totalViews from the views field, and sets totalVideos to 1 for counting purposes.
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                // totalVideos: 1               
            }
        },
        // The $group stage in MongoDB's aggregation framework is used to group documents by a specified identifier expression and perform aggregate operations (such as sum, average, etc.) on grouped data. 
        {
            $group: {
                // This line specifies the grouping key. By setting _id to null, we are effectively saying that all documents should be grouped into a single group. This is useful when you want to calculate aggregate values across the entire collection or the result of the previous stages in the pipeline.
                _id: null,

                // This line creates a new field called totalLikes in the output document.
                $totalLikes: {
                    $sum: "totalLikes"
                },
                totalViews: {
                    $sum: "totalViews"
                },
                // This line creates a new field called totalVideos in the output document.
                totalVideos: {
                    // The $sum accumulator operator is used to count the number of documents (videos) in the group. By summing 1 for each document, it effectively counts the number of videos.
                    $sum: 1
                }

            }
        }
    ])

    const channelstats = {
        totalSubscribers: totalSubscribers || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
    }

    return res
        .status(200)
        .json( new ApiResponse(200, channelstats, "channalStats fetched successfully"))

})

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likesCount: 1
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "channel stats fetched successfully"
        )
    );
})

export {
    getChannelStats, 
    getChannelVideos
    }