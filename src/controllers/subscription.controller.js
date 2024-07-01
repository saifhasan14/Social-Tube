import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (isSubscribed) {
        const unsubscribed = await Subscription.findByIdAndDelete(isSubscribed?._id);

        if(!unsubscribed){
            throw new ApiError(500, "unsubscribing failed try again")
        }

        return res
            .status(200)
            .json(new ApiResponse(
                    200,
                    { subscribed: false },
                    "unsunscribed successfully"
                )
            )
    }

    const subscribed = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(subscribed){
        throw new ApiError(500, "subscribing failed try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
                200,
                { subscribed: true },
                "subscribed successfully"
            )
        )
})

// try in routess !! controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        // This stage counts the number of documents that pass through it and outputs a document with the count in the field named matchedDocuments -> totalSubscriber
        {
            $count: "totalSusbcribers"
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            // tumhare subscriber k kitne subcriber hai
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                totalSubscriber: 1,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ])

    if(!subscriberList){
        throw new ApiError(500, "error while fetching subscriber list")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscriberList,
                "subscribers fetched successfully"
            )
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberID");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subrciber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        // count total subscribed channels
        {
            $count: "totalChannelSubscribed"
        },
        // Lookup the subscribed channels' user details
        {
           $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                // pipeline: [
                //     {
                //         $lookup: {
                //             from: "videos",
                //             localField: "_id",
                //             foreignField: "owner",
                //             as: "videos",
                //         },
                //     },
                //     {
                //         $addFields: {
                //             latestVideo: {
                //                 $last: "$videos",
                //             },
                //         },
                //     },
                // ]
            }
        },
        // Unwind the subscribedChannel array
        {
            $unwind: "$subscribedChannel",
        },
        // Lookup the latest video for each subscribed channel
        {
            $lookup: {
                from: "videos",
                localField: "subscribedChannel._id", // users id
                foreignField: "owner",
                as: "latestVideo",
                pipeline: [
                    // Sort videos by createdAt in descending order to have the latest video first.
                    {
                        $sort: { createdAt: -1 },
                    },
                    // $limit: Limit the result to only the first document (latest video).
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            _id: 1,
                            "videoFile.url": 1,
                            "thumbnail.url": 1,
                            owner: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            createdAt: 1,
                            views: 1,
                        },
                    },
                ],
            },
        },
        // Unwind the latestVideo array, allowing empty arrays
        // Unwind the latestVideo array. Use preserveNullAndEmptyArrays: true to ensure channels without any videos are still included in the result, with latestVideo being null or empty.
        {
            $unwind: {
                path: "$latestVideo",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: 1,
                    // latestVideo: {
                    //     _id: 1,
                    //     "videoFile.url": 1,
                    //     "thumbnail.url": 1,
                    //     owner: 1,
                    //     title: 1,
                    //     description: 1,
                    //     duration: 1,
                    //     createdAt: 1,
                    //     views: 1
                    // },
                },
            },
        },
    ])

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}