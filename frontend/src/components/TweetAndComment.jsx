// import React from "react";
// import Button from "./Button";
// import { useForm } from "react-hook-form";
// import { useDispatch } from "react-redux";
// import { createTweet } from "../store/Slices/tweetSlice";
// import { createAComment } from "../store/Slices/commentSlice";

// function TweetAndComment({ tweet, comment, videoId }) {
//     const { register, handleSubmit, setValue } = useForm();
//     const dispatch = useDispatch();

//     const sendContent = (data) => {
//         if (data) {
//             if (tweet) {
//                 dispatch(createTweet(data));
//             } else if (comment) {
//                 dispatch(createAComment({ content: data.content, videoId }));
//             }
//             setValue("content", "");
//         }
//     };

//     return (
//         <>
//             <form
//                 onSubmit={handleSubmit(sendContent)}
//                 className="sm:p-5 p-3 sm:max-w-4xl w-full relative"
//             >
//                 <textarea
//                     placeholder={`${tweet ? "Write a tweet" : "Add a Comment"}`}
//                     className="p-2 text-sm pr-16 focus:border-white text-white border border-slate-500 bg-[#222222] outline-none w-full"
//                     {...register("content", { required: true })}
//                     rows={2}
//                 />
//                 <Button
//                     type="submit"
//                     className="bg-purple-500 px-2 py-1 text-black hover:scale-110 transition-all ease-in absolute sm:bottom-8 sm:right-8 bottom-8 right-4 text-xs sm:text-base"
//                 >
//                     Send
//                 </Button>
//             </form>
//         </>
//     );
// }

// export default TweetAndComment;

import React, { useState } from "react";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createTweet } from "../store/Slices/tweetSlice";
import { createAComment } from "../store/Slices/commentSlice";

function TweetAndComment({ tweet, comment, videoId }) {
    const { register, handleSubmit, setValue } = useForm();
    const dispatch = useDispatch();
    const [content, setContent] = useState("");

    const sendContent = (data) => {
        if (data) {
            if (tweet) {
                dispatch(createTweet(data));
            } else if (comment) {
                dispatch(createAComment({ content: data.content, videoId }));
            }
            setValue("content", "");
            setContent("");
        }
    };

    const handleInputChange = (event) => {
        setContent(event.target.value);
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(sendContent)}
                className="sm:p-5 p-3 sm:max-w-4xl w-full relative"
            >
                <textarea
                    placeholder={`${tweet ? "Write a tweet" : "Add a Comment"}`}
                    className="p-2 text-sm pr-16 focus:border-white text-white border border-slate-500 bg-[#222222] outline-none w-full resize-none overflow-hidden"
                    {...register("content", { required: true })}
                    rows={3}
                    style={{ height: "auto" }}
                    value={content}
                    onChange={(e) => {
                        handleInputChange(e);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                />
                <Button
                    type="submit"
                    className="bg-purple-500 px-2 py-1 text-black hover:scale-110 transition-all ease-in absolute sm:bottom-8 sm:right-8 bottom-8 right-4 text-xs sm:text-base"
                >
                    Send
                </Button>
            </form>
        </>
    );
}

export default TweetAndComment;
