import express, { urlencoded } from "express";
import cors from "cors"
import cookieparser from "cookie-parser";


const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({extended: true, limit: '20kb'}));
app.use(express.static('public'));
app.use(cookieparser());

import userRouter from "./routes/user.js";
app.use("/user", userRouter);

export {app};