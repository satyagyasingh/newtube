import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import { uploadOnCloudinary } from "./utils/cloudinary.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(async () => {
    console.log("MongoDB Connected!");

    // Test Cloudinary upload
    // const testFileURL = "https://res.cloudinary.com/djh3von8g/image/upload/v1734531748/cld-sample-5.jpg";
    // const uploadResponse = await uploadOnCloudinary(testFileURL);
    // if (uploadResponse) {
    //   console.log("Cloudinary Upload Successful:", uploadResponse);
    // } else {
    //   console.log("Cloudinary Upload Failed.");
    // }

    // Setup a basic route
    app.get("/", (req, res) => {
      res.send("Server running");
    });

    // Start the server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!!!", error);
  });
