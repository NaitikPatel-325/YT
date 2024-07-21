import mongoose,{Schema} from "mongoose";
import mongooseaggregatepaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videofile:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    duration:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"

    }
},
{
    timestamps:true
});

videoSchema.plugin(mongooseaggregatepaginate);
export const Video = mongoose.model("Video", videoSchema);