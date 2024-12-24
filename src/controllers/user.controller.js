import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req,res) => {
    console.log(req.body);
    
    const {fullName, email ,username, password} = req.body;
    console.log("email : ",username);

    return res.status(200).json({
        data : req.body,
        third : "this",
        message : "ok"
    })
})






export default registerUser;





