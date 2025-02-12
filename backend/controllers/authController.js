//Global Import
import bcryptjs from "bcryptjs";
import crypto from "crypto";

//Local Import
import { UserModel } from "../models/UserModel.js";
import { generateVerificationToken, generateTokenAndSetCookie } from "../utils/tokenGenerator.js";
import { 
    sendVerificationEmail, 
    sendCongratulatoryEmail, 
    sendPasswordResetEmail, 
    sendPasswordResetSuccessEmail 
} from "../mailtrap/sendEmails.js";


export const signup = async (req, res) => {
    const { email, password, name } = req.body

    try {
        if(!email || !password || !name) {
            console.log("validation failed");

            throw new Error("All fields are required");
        }

        const userAlreadyExists = await UserModel.findOne({ email });
        if(userAlreadyExists) {
            console.log("User already exists");
            return res.status(400).json({ success:false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 12);
        const verificationToken = generateVerificationToken();
        const user = new UserModel({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //24 hours
        })

        await user.save();

        generateTokenAndSetCookie(res,user._id);
       
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        })

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;

    try {
        const user = await UserModel.findOne( {
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendCongratulatoryEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        })

    } catch (error) {
        console.error("Error in verifying email:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if(!user) {
            return  res.status(400).json({ success: false, message: "Invalid Credentials"});
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid Credentials"});
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        })

    } catch (error) {
        console.error("Error authenticating user: ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const forgotPassword = async (req, res) => {
    
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found"});
        }

        //Generating Token to Reset Password
        const resetToken = crypto.randomBytes(50).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        // resetPasswordToken and resetPasswordTokenExpiresAt at the document field stored in the DB
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

        await user.save();

        // Send Reset link to user email
        await sendPasswordResetEmail(user.email, user.name, `${process.env.CLIENT_URL}/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link has been sent to your email" });
    } catch (error) {
        console.error("Error sending reset link: ", error);
        res.status(500).json({ success: false, message: "Sending reset link failed"});
    }
}

export const resetPassword = async (req, res) => {
    
    try {
        const { token } = req.params;
        const { password } = req.body;


        const user = await UserModel.findOne({ 
            resetPasswordToken : token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() },
         });

        if(!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token"});
        }

        //Hash the new Password
        const hashedPassword = await bcryptjs.hash(password, 12);

        //Update user password with the new hash in DB
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;

        await user.save();

        // Send Reset success email
        await sendPasswordResetSuccessEmail(user.email, user.name);

        res.status(200).json({ success: true, message: "Password was reset successfully" });
    } catch (error) {
        console.error("Error sending reset link: ", error);
        res.status(500).json({ success: false, message: "Sending reset link failed"});
    }
}

export const checkAuth = async (req, res)  => {
    try {
        const user = await UserModel.findById(req.userId).select("-password");
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user});
        
    } catch (error) {
        console.log("Error in Authentication ", error);
        res.staus(400).json({ success: false, message: error.message });
    }
}

export const signout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}