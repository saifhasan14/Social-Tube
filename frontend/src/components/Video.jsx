import React from "react";

function Video({ src, poster }) {
    return (
        <video
            ref={(video) => {
                if (video) video.volume = 0.5; // Set the default volume to 50%
            }}
            src={src}
            poster={poster}
            autoPlay
            controls
            playsInline
            className="sm:h-[68vh] sm:max-w-4xl h-64 w-full object-contain"
        ></video>
    );
}

export default Video;


// import React, { useRef, useEffect } from "react";

// function Video({ src, poster }) {
//     const videoRef = useRef(null);

//     useEffect(() => {
//         const videoElement = videoRef.current;

//         const handlePlay = () => {
//             if (videoElement) {
//                 videoElement.muted = false;
//                 videoElement.volume = 1.0;
//             }
//         };

//         if (videoElement) {
//             videoElement.addEventListener('play', handlePlay);
//         }

//         return () => {
//             if (videoElement) {
//                 videoElement.removeEventListener('play', handlePlay);
//             }
//         };
//     }, []);

//     return (
//         <video
//             ref={videoRef}
//             src={src}
//             poster={poster}
//             autoPlay
//             controls
//             playsInline
//             className="sm:h-[68vh] sm:max-w-4xl h-64 w-full object-contain"
//             muted // start muted to respect autoplay policies
//         ></video>
//     );
// }

// export default Video;
