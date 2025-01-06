import { Router } from "express";
import  {registerUser, loginUser, logOutUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router(); // Correctly create an instance of Router



router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "coverImage",
            maxCount : 1,
        }
    ]),
    registerUser); // Use the instance 'route'


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router;
