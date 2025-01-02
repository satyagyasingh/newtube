import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId)=>{
  try{
    const myuser = await User.findById(userId)
    const refreshToken = myuser.generateRefreshToken()
    const accessToken = myuser.generateAccessToken()

    myuser.refreshToken = refreshToken
    await myuser.save({validateBeforeSave : false})

    return {accessToken,refreshToken}

  }catch{
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }
}

// inside usercontroller file
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
    
    // console.log(req.body);
    
    const {fullName, email ,username, password} = req.body;
    // console.log(req.body); 

    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }

    if (
      [fullName, email, username, password].some(
        (feild) => feild?.trim() === ""
      ) //return -s true if any of feild is empty
    ) {
      throw new ApiError(
        400,
        "All feilds  (fullName,email,username, password) are required"
      );
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existedUser) {
      throw new ApiError(409, "User with username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar && req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage && req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new ApiError(400, "unable to upload Avatar to cloudinary");
    }
    // console.log(avatar);

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password: password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));


})

const loginUser = asyncHandler(async (req,res) =>{
  //get data from req->data
  //login using email or username
  //check passd 
  //if correct return access token and refresh token
  //send cookie

  const {email, username, password} = req.body
  
  if(! username && !email){
    throw new ApiError(400, "username of email is required")
  }

  const myuser = await User.findOne(
    {
      $or :[{username} , {email}]
    }
  )

  if(!myuser){
    console.log("hand")
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid= await myuser.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credintials")
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(myuser._id)
  
  const loggedInUser = await User.findById(myuser._id).select("-password -refreshToken")

  //sending cookeis

  const options = {
    httpOny : true,
    secure : true,
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user : loggedInUser,accessToken,refreshToken
      },
      "User logged in successfully"
    )
  )

})


const logOutUser = asyncHandler(async(req,res) => {
    await User.findById(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new : true //returned user will contain new values
      }
    )

    const options = {
      httpOny : true,
      secure : true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},"User Logged Out"))
    
})


export {
  registerUser,
  loginUser,
  logOutUser
};





