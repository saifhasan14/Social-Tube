import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription 
} from "../controllers/subscription.controller.js";


const router = Router();
router.route(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router
    .route("/c/:channelId")
    .get(verifyJWT,getUserChannelSubscribers)
    .post(verifyJWT,toggleSubscription);

router.route("/u/:subscriberId").get(verifyJWT,getSubscribedChannels);

export default router
