import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./env", 
});

connectDB()
.then(() => {
    application.listen(process.env.PORT || 8000, () => {
        console.log(`server is runnign at port ${process.env.PORT || 8000}`);
    })
}
).catch((error) => {
    console.log("MONGO db connection failed !!!" , err)
})


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
