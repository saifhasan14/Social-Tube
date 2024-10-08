import mongoose, { Schema, isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//TODO: get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // await keyword is not used as it is aggregate paginate
    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                // still array me hi milega
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            "avatar.url": 1,
                        }
                    }
                ]
            }
        },
        // Use $unwind to convert the owner array into a single embedded object. 
        // because here we will get owner array with one object in it so we ca use $unwind
        // {
        //     $unwind: "$owner"
        // },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                // to send owner as object not as array rewriting -> ref user.controller
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
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
                content: 1,
                createdAt: 1,
                likesCount: 1,
                // owner: {
                //     username: 1,
                //     fullName: 1,
                //     "avatar.url": 1
                // },
                isLiked: 1,
                owner: 1,
            }
        }
    ]);

    // it is not a array like aggregation pipeline
    // its is a object
    // console.log("commentsAggregate: ",commentsAggregate); 

    // fails when there is no comment 
    // if(!commentsAggregate?.length){
    //     throw new ApiError(500, "commensts not fetched")
    // }

    // for aggregatepaginate
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

//  add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
        .status(200)
        .json( new ApiResponse(201, comment, "Comment added succesfully"))

})

//  update a comment
const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user?._id.toString() ){
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment edited successfully")
        );


})

// delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only comment owner can delete their comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(comment?._id)
    console.log("deleted comment: ", deletedComment);

    if(!deletedComment){
        throw new ApiError(500, "comment not deleted try again")
    }

    await Like.deleteMany({
        comment: commentId,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, { }, "Comment deleted successfully")
        );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
