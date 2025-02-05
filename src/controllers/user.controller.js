import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';


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

    // console.log("req : ")

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

const loginUser = asyncHandler(async (req,res) => {
    
  const {email ,username, password} = req.body;
  // console.log("req : ")
  // console.log(req.body); 
  
  if(!email && !username){

    throw new ApiError(400, "username or email is required")
  }

  const myuser = await User.findOne(
    {
      $or :[{username} , {email}]
    }
  )
  // console.log("here isthe user : " + myuser)
  if(!myuser){
    // console.log("hand")
    throw new ApiError(404, "User does not exist")
  }
  // console.log(myuser)
  // console.log(password)

  const isPasswordValid = await myuser.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credintials")
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(myuser._id)
  
  const loggedInUser = await User.findById(myuser._id).select("-password -refreshToken")

  //sending cookeis

  const options = {
    httpOnly : true,
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

const refreshAccessToken =asyncHandler(async(req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorised Refresh token is required")
  }

  const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
  const myUser = await User.findById(decodedToken?._id)

  if(!myUser){
    throw new ApiError(401, "Invalid refresh token, User not found")
  } 

  if(myUser?.refreshToken !== incomingRefreshToken){
    throw new ApiError(401, "Refresh token is expired or used") 
  }

  const options = {
    httpOny : true,
    secure : true,
  }

  const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(myUser._id)

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        accessToken,
        newRefreshToken
      },
      "Access token refreshed successfully"
    )
  )

})

const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {currentPassword , newPassword} = req.body

  const user = await User.findById(req.user._id)
  
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid current password")
  }

  user.password = newPassword;
  await user.save({validateBeforeSave : false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Passwword changed"))
   
})



const getCurrentUSer = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200, req.user, "logged in user has been fetched yayy")
})


const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullName, email} = req.body
  if(!fullName || !email){
    throw new ApiError(400, "All  feilds are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?. _id,
    {
      $set :{
        fullName,
        email : email
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user , "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req, res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uploading on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        avatar : avatar.url
      }
    },
    {new : true}
  )

  return res
  .staus(200)
  .json(
    new ApiResponse(200, user, "avatar updated successfully")
  )

})



const updateUserCoverImage = asyncHandler(async(req, res)=>{
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400, "coverImage file is required")
  }

  
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        coverImage : coverImage.url
      }
    },
    {new : true}
  )

  return res
  .staus(200)
  .json(
    new ApiResponse(200, user, "CoverImage updated successfully")
  )


})

const getUserChannelProfile = asyncHandler(async(req,res) => {
  const {username} = req.params

  if(!username ?. trim()) {
    throw new ApiError(400, "Username is missing") 
  }

  const channel = await User.aggregate([
    {
      $match : {
        username : username ?.toLowerCase()
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localFeild : "_id",
        foreignFeild : "channel",
        as : "subscribers"
      }
    },
    {
      from : "subscriptinons",
      localFeild : "_id",
      foreignFeild : "subscriber",
      as : "subscribedTo"
    },
    {
      $addFields : {
        subscribersCount : {
          $size : "$subscribers"
        },
        channelsSubscribedToCount : {
          $size : "$subscribedTo"
        },
        isSubscribed : {
          $cond : {
            if : {$in : [req.user ?. _id , "subscribers.subscriber"]},
            then : true,
            else : false
          }
        }
      }
    },
    {
      $project :{
        fullName :1,
        username : 1,
        subscribersCount : 1,
        isSubscribed : 1,
        avatar : 1,
        coverImage : 1,
        email :1
      }
    }
  ])
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUSer,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};





