import { Router } from "express";
import  {register,loginuser,logoutuser,refreshToken}  from "../controllers/user.js";
import {upload} from "../middlewares/multer.js";
import verifyjwt from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    register)

router.route("/login").post(loginuser);

router.route("/logout").post(
    verifyjwt,
    logoutuser);

router.route("/refresh_token").post(refreshToken);
export default router;
