import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTweets } from "../store/Slices/tweetSlice";
import { TweetAndComment, TweetsList } from "../components";

function GetTweets() {
    const dispatch = useDispatch();
    const authId = useSelector((state) => state.auth?.userData?._id);
    const userId = useSelector((state) => state.user?.profileData?._id);
    const allTweets = useSelector((state) => state.tweet?.allTweets);

    useEffect(() => {
        dispatch(getAllTweets());
    }, [dispatch]);

    return (
        <>
        {authId === userId && <TweetAndComment tweet={true} />}
        <div
            className="overflow-y-auto h-screen"  // Make this container scrollable with full screen height
            style={{ maxHeight: "80vh", padding: "10px" }}  // Optional: max height and padding
        >
            {allTweets?.map((tweet) => (
                <TweetsList
                    key={tweet?._id}
                    avatar={tweet?.ownerDetails?.avatar.url}
                    content={tweet?.content}
                    createdAt={tweet?.createdAt}
                    likesCount={tweet?.likesCount}
                    tweetId={tweet?._id}
                    username={tweet?.ownerDetails?.username}
                    isLiked={tweet?.isLiked}
                    />
                ))}
        </div>
        </>
    );
}

export default GetTweets;
