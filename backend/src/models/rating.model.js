// models/Rating.js
import mongoose, {Schema} from "mongoose";

const RatingSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        // required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        // required: true,
    },
}, {
    timestamps: true
});

export const Rating = mongoose.model('Rating', RatingSchema);
