import asyncHandler from "../utils/asyncHandler.js";
import apierror from "../utils/apierror.js";
import {User} from "../models/user.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const register = asyncHandler(async (req, res) => {
    console.log(req.body);
    const{fullName,email,username,password}  = req.body;
    console.log(fullName,email,username,password);  

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

export default register ;
