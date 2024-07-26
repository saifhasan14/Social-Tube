// import multer from "multer";

// // Configure multer for in-memory storage
// const storage = multer.memoryStorage();

// export const upload = multer({
//   storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50 MB file size limit
//   },
// });

// uploading using local storage

import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         // cb(null, file.fieldname + '-' + uniqueSuffix)
//         cb(null, file.originalname)
//         // cb(null, Date.now() + file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage,
// })

export const upload = multer({ 
    storage: multer.diskStorage({}),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB file size limit
    }
})