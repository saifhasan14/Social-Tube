// components/Rating.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRating, rateVideo } from '../store/Slices/ratingSlice';
import { useParams } from 'react-router-dom';

function Rating(){
    const { videoId } = useParams();
    const dispatch = useDispatch();
    const { averageRating, totalRatings, userRating, loading } = useSelector(state => state.rating);
    const [rating, setRating] = useState(userRating);

    // console.log(averageRating, totalRatings, userRating);

    useEffect(() => {
        if(videoId){
            dispatch(getRating(videoId));
        }
    }, []);

    const handleRating = async (newRating) => {
        setRating(newRating);
        await dispatch(rateVideo({ videoId: videoId, rating: newRating }));
        dispatch(getRating(videoId));
    };
    return (
        <div className="flex items-center gap-1">
            <h3 className="text-sm text-slate-400 mr-2 ml-2">Rate:</h3>
            {[...Array(10)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => handleRating(i + 1)}
                    className={`w-6 h-6 text-center rounded-full ${rating > i ? 'bg-blue-500' : 'bg-gray-400'} text-xs text-black`}
                >
                    {i + 1}
                </button>
            ))}
            <div className="ml-2 text-sm text-slate-400 ">
                {loading ? "Loading..." : `Avg: ${averageRating?.toFixed(1)} (${totalRatings})`}
            </div>
        </div>
    );
};

export default Rating;
