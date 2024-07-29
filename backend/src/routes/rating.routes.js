import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addNewRating, getAverageRating } from '../controllers/rating.controller.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/rate/:videoId").post(addNewRating);
router.route("/average/:videoId").get(getAverageRating);


export default router