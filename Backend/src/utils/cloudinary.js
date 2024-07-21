import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadoncloudinary = async (localfilepath) => {
    try {
        if(!localfilepath)
            return null;
        const result = await cloudinary.uploader.upload(localfilepath,{resource_type: "auto"});
        console.log("File is uploaded on cloudinary",result.url);
        fs.unlinkSync(localfilepath);
        return result;
    }
    catch (error) {
        fs.unlinkSync(localfilepath);
        console.log(error);
        return null;
    }
}


export {uploadoncloudinary};