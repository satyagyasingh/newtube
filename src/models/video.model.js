import mongoose, {Schema} from "mongoose";

const videoSchema = new (
    {
        videoFile : {
            type : String, //cloudnary url
            required : true,
        },
        thumbnail : {
            type : String, //cloudnary url
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number , //cloudnary url
            required : true
        },
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {
        timeStamps : true
    }
)