import {isValidObjectId} from 'mongoose';
import { Rating } from '../models/rating.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';


// Add a new rating
const addNewRating = asyncHandler(async (req, res) => {
    const { videoId} = req.params;
    const {rating} = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    
    // Check if the user has already rated this video
    let existingRating = await Rating.findOne({
        videoId,
        userId: req.user?._id, 
    });

    if (existingRating) {

        existingRating.rating = rating;
        await existingRating.save();

        return res
            .status(200)
            .json( new ApiResponse(200, existingRating, "video rating updated successfully" ));
    }

    const newRating = new Rating({ videoId, userId: req.user?._id, rating });
    await newRating.save();

    return res
        .status(200)
        .json( new ApiResponse(200, newRating, "video rated successfully" ));

})



// Get average rating for a video
const getAverageRating = asyncHandler( async(req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "this is Invalid videoId");
    }

    const ratings = await Rating.find({ videoId });
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    const userId = req.user?._id;

    const userRating = await Rating.findOne({ videoId, userId}).select('rating');

    return res
        .status(200)
        .json( new ApiResponse( 
            200, {
            averageRating: averageRating || 0, totalRatings: ratings.length, userRating: userRating?.rating},
            "avg rating fetched succesfully"
        ))
})


export {
    addNewRating,
    getAverageRating,
}
