import { Router } from "express";
import  registeruser  from "../controllers/user.js";
import {upload} from "../middlewares/multer.js";

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
    registeruser)

export default router;
