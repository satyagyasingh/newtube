import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";


const registerUser = asyncHandler(async (req,res) => {
    
    // get user details from frontend
    // validation — not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object
    // create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    console.log(req.body);
    
    const {fullName, email ,username, password} = req.body;
    console.log("email : ",username);

    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }

    if(
        [fullName,email,username, password].some((feild) =>
        feild?.trim() === "")//return -s true if any of feild is empty
    ){
        throw new ApiError(400,"All feilds are required")
    }

    

    return res.status(200).json({
        data : req.body,
        third : "this",
        message : "ok"
    })
})






export default registerUser;





