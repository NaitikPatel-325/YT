import express, { urlencoded } from "express";
import cors from "cors"
import cookieparser from "cookie-parser";
import userRouter from "./routes/user.js";


const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({extended: true, limit: '20kb'}));
app.use(express.static('public'));
app.use(cookieparser());

app.use("/user", userRouter);

export {app};