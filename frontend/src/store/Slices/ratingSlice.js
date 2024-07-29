import {createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";

const  initialState = {
    averageRating: 0,
    totalRatings: 0,
    userRating: null,
    loading: false,
};

export const getRating = createAsyncThunk(
    "getRating",
    async (videoId) => {
        try {
            const response = await axiosInstance.get(
                `/rating/average/${videoId}`
            );
            console.log(response);
            // toast.error(response.data.data);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const rateVideo = createAsyncThunk(
    "rateVideo",
    async ({videoId, rating}) => {
        try {
            const response = await axiosInstance.post(
                `/rating/rate/${videoId}`,
                {rating}
            );
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);


const ratingSlice = createSlice({
    name: "rating",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRating.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRating.fulfilled, (state, action) => {
                state.loading = false;
                state.averageRating = action.payload.averageRating;
                state.totalRatings = action.payload.totalRatings;
                state.userRating = action.payload.userRating;
            })
            .addCase(getRating.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(rateVideo.pending, (state) => {
                state.loading = true;
            })
            .addCase(rateVideo.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(rateVideo.rejected, (state, action) => {
                state.loading = false;
            });
    },
});

export default ratingSlice.reducer;

