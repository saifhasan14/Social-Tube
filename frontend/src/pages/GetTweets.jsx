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
        <div className="h-screen flex flex-col">
            {/* {authId === userId && <TweetAndComment tweet={true} />} */}
            <TweetAndComment tweet={true} />
            <div
                className="overflow-y-auto flex-grow"  // Flex-grow allows this div to take up remaining space and become scrollable
                style={{ padding: "10px" }}
            >
                {allTweets?.map((tweet) => (
                    <TweetsList
                        key={tweet?._id}
                        avatar={tweet?.ownerDetails?.avatar?.url}
                        content={tweet?.content}
                        createdAt={tweet?.createdAt}
                        likesCount={tweet?.likesCount}
                        tweetId={tweet?._id}
                        username={tweet?.ownerDetails?.username}
                        isLiked={tweet?.isLiked}
                    />
                ))}
            </div>
        </div>
    );
}

export default GetTweets;
