// import cloudinary from "cloudinary";
// import { v2 as cloudinaryV2 } from 'cloudinary';
import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { Readable } from "stream";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET   // Click 'View Credentials' below to copy your API secret
});

// uploading using stream
// const uploadStream = (buffer, folder) => {
//     return new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           folder,
//           resource_type: "auto",
//         },
//         (error, result) => {
//           if (error) {
//             return reject(error);
//           }
//           resolve(result);
//         }
//       );
  
//       const readableStream = new Readable();
//       readableStream._read = () => {}; // No-op
//       readableStream.push(buffer);
//       readableStream.push(null);
//       readableStream.pipe(stream);
//     });
//   };
  
//   const uploadOnCloudinary = async (fileBuffer, folder) => {
//     try {
//       if (!fileBuffer) return null;
//       const response = await uploadStream(fileBuffer, folder);
//       return response;
//     } catch (error) {
//       console.error("Cloudinary upload error:", error);
//       return null;
//     }
//   };

// const uploadOnCloudinary = async (buffer, folder) => {
//     return new Promise((resolve, reject) => {
//         cloudinaryV2.uploader.upload_stream(
//             { folder },
//             (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         ).end(buffer);
//     });
// };


// upload using file stored on local

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // upload file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded succesfully
        // console.log("file uploaded on cloudinary", response.url);
        // console.log("file uploaded on cloudinary", response);
        // fs.unlinkSync(localFilePath);
        return response;
    }
    catch(error){
        // fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload failed
        return null;
    }
}

const deleteOnCloudinary = async(public_id, resource_type="image") => {
    try {
        if (!public_id) return null;

        const result = cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        })
    } catch (error) {
        // console.log("delete on cloudinary failed");
        return error
    }
}


export {
    uploadOnCloudinary,
    deleteOnCloudinary,
}

// Upload an image
// const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
//     public_id: "shoes"
// }).catch((error)=>{console.log(error)}); 