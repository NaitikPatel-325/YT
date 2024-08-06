import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import apierror from "../utils/ApiError.js";

const varifyjwt = asyncHandler(async (req, res, next) => {
   try {
     const token = req.cookies?.accessToken || req.headers?.("authorization").replace("Bearer ", "");  
 
     if(!token){
         return apierror(401,"Unauthorized Request");
     }
 
     const decoded = jwt.verify(token,process.env.ACESS_TOKEN_SECRET);
 
     const user = await User.findById(decoded._id).select("-password -refreshToken");
 
     if(!user){
         return new apierror(404,"User does not exist");
     }
 
     req.user = user;
     next();
   } catch (error) {
        throw new apierror(401,error?.message || "Unauthorized Request");
   }

});
export  default varifyjwt;