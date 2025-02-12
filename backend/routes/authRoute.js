import express from "express";
import {signup, verifyEmail, signin, forgotPassword, resetPassword, signout, checkAuth } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();


router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post('/checkpoint/verify_email', verifyEmail);

router.post("/signin", signin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);


router.post("/signout", signout);



export default router;