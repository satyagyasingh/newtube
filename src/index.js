import connectDB from "./db/index.js";
import dotenv from "dotenv";

// Configure dotenv
dotenv.config({
  path: "./env", // Ensure the path to your .env file is correct
});

// Connect to the database
connectDB();

/*
;( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}
            /${DB_NAME}`)
        app.on("error" , (error) => {
            console.log("ERROR: ",error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
        
    }catch (error){
        console.error("ERROR: ", error)
        throw error
    }
})()
*/
