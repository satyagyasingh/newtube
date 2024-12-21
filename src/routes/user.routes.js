import { Router } from "express";
import registerUser from "../controllers/user.controller.js";

const router = Router(); // Correctly create an instance of Router

router.route("/register").post(registerUser); // Use the instance 'route'
export default router;
