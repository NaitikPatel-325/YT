import asyncHandler from "../utils/asyncHandler.js";
import apierror from "../utils/ApiError.js";
import User from "../models/User.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateRefreshTokenandaccesstoken  = async (userid) => {
    const user = await User.findById(userid);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken; 
    await user.save({validateBeforeSave:false}); 
    return {refreshToken,accessToken};

}

const register = asyncHandler(async (req, res) => {
    // console.log(req.body);
    const{fullName,email,username,password}  = req.body;
    // console.log(fullName,email,username,password);  

    if([fullName,email,username,password].some((field) => field?.trim()==='')){
        throw new apierror(400,"Please fill all the fields");
    }

    const existeduser =await User.findOne({
        $or:[{email},{username}]
    })

    if(existeduser){
        throw new apierror(409,"User already exists");
    }

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path; 

    let coverimagepath;
    if(req.files && Array.isArray(req.files.coverImage) && req.coverImage.length > 0){
        coverimagepath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath ){
        throw new apierror(400,"Please upload avatar and cover image");
    }

    const avatar = await uploadoncloudinary(avatarLocalPath);
    const coverImage = await uploadoncloudinary(coverimagepath);

    if(!avatar)
        throw new apierror(500,"Error in uploading avatar image");

    // console.log(avatar.url);
    const user = await User.create({
        fullName,
        email,
        username : username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || " ",
    });
    const saveduser = await User.findById(user._id).select("-password -refreshToken");


    if(!saveduser){
        throw new apierror(500,"Error in creating user");
    }
    // console.log("saved" + saveduser);
    return res.status(201).json(new ApiResponse(200,"User registered successfully",{user:saveduser}));  
})

const loginuser = asyncHandler(async (req, res) => {
    const{email,username,password}  = req.body;
    if(!email && !username ){
        throw new apierror(400,"Please provide email and username");
    }

    const user = await User.findOne({ $or: [{ email }, { username }]});

    if(!user){
        throw new apierror(404,"User Does not exist");
    }

    const ismatch = await user.passwordCheck(password);    

    if(!ismatch){
        throw new apierror(401,"Password is incorrect");
    }
    
    const {refreshToken,accessToken} = await generateRefreshTokenandaccesstoken(user._id);

    const loggedinuser = await User.findOne({ $or: [{ email }, { username }]}).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,{user:loggedinuser,accessToken,refreshToken},"User logged in successfully"));

})

const logoutuser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        },
    );
    
    const options = {
        httpOnly:true,
        secure:true
    }

    return res.
    status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"));
    
});

const refreshToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingrefreshToken){
        throw new apierror(401,"Unauthorized Request");
    }

    try {
        const decoded = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET);
        // console.log(decoded);
        const user = await User.findById(decoded?.id);
        // console.log(user);
 
        if(!user){
            throw new apierror(404,"Invalid Refresh Token");
        }
 
        if(user.refreshToken !== incomingrefreshToken){
            throw new apierror(401,"REFRESH TOKEN EXPIRED");
        }
 
        const options = {
            httpOnly:true,
            secure:true
        }
 
        const {refreshToken,accessToken} = await generateRefreshTokenandaccesstoken(user._id);
        // console.log(refreshToken,accessToken);
        return res
        .status(200)
        .cookie("refreshToken",refreshToken,options)
        .cookie("accessToken",accessToken,options)
        .json(new ApiResponse(200,"Token Refreshed successfully"));
 
    }catch (error) {
        throw new apierror(401,error?.message || "Unauthorized Request");
    }
});

export { register,loginuser,logoutuser,refreshToken };  
