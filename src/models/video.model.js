import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: {
                url: String,
                public_id: String
            }, //cloundnary url
            rerquired: true
        },
        thumbnail: {
            type: {
                url: String,
                public_id: String,
            },
            required: true
        },
        title: {
            type: String, 
            rerquired: true
        },
        discription: {
            type: String, 
            rerquired: true
        },
        duration: {
            type: Number, //from cloundnary url
            rerquired: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)
