import User from "../models/user.model.js";
import githubService from "../services/github.service.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import {config} from "dotenv";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email-client.js";

config();

const githubAuth = (req, res) => {

    const url = githubService.getAuthUrl();

    res.send(`<a href="${url}">Login with GitHub</a>`);
}


const githubCallback = async (req, res) => {
    try {

        const { code } = req.query;
        const response = await githubService.getUser(code);
        res.json(response);

    } catch (error) {

        console.log("ERROR:", error.response?.data || error.message);
        res.status(500).json(error.response?.data);

    }
};

const getUserRepos = async (req, res) => {
    try {

        const accessToken = req.query.accessToken || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const data = await githubService.getUserRepos(accessToken);
        res.json(data);

    } catch (error) {

        console.log('ERROR:', error.response?.data || error.message);
        res.status(500).json(error.response?.data || error.message);

    }
};

const getUserCommits = async (req, res) => {
    try {
        const accessToken = req.query.accessToken || req.headers.authorization?.split(' ')[1];
        const { owner, repo } = req.query;

        const data = await githubService.getUserCommits(accessToken, owner, repo);
        res.json(data);

    } catch (error) {
        console.log('ERROR:', error.response?.data || error.message);
        res.status(500).json(error.response?.data || error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Email not verified",
                requiresVerification: true,
                email: user.email,
            });
        }

        const token = JWT.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body || {};

        if(!username || !email || !password){
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ error: "An account with this email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ error: "This username is already taken" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hashedPassword });

        const otp = user.generateEmailOTP();
        await user.save();

        const emailResult = await sendVerificationEmail(email, otp);
        if (!emailResult?.success) {
            // User is created but email failed — still tell them to verify
            console.error("Failed to send verification email:", emailResult?.error);
            return res.status(201).json({
                message: "Account created but we couldn't send the verification email. Please use 'Resend code' on the next page.",
                requiresVerification: true,
                email: user.email,
            });
        }

        res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            requiresVerification: true,
            email: user.email,
        });

    } catch (error) {
        console.error("Error registering user:", error);

        // Handle MongoDB duplicate key error (race condition fallback)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            if (field === "email") {
                return res.status(409).json({ error: "An account with this email already exists" });
            }
            if (field === "username") {
                return res.status(409).json({ error: "This username is already taken" });
            }
            return res.status(409).json({ error: "Account already exists" });
        }

        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
}


const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Debug logging
        console.log("VerifyEmail - Received OTP:", otp, "Type:", typeof otp);

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        const user = await User.findOne({ email }).select("+emailOTP +emailOTPExpires");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Debug logging
        console.log("VerifyEmail - Stored OTP hash:", user.emailOTP);
        console.log("VerifyEmail - OTP Expires:", user.emailOTPExpires);
        console.log("VerifyEmail - Current time:", new Date());

        if (!user.emailOTP || !user.emailOTPExpires) {
            return res.status(400).json({ error: "No OTP found. Please request a new one." });
        }

        if (user.emailOTPExpires < new Date()) {
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        // Ensure OTP is string
        const otpString = String(otp).trim();
        console.log("VerifyEmail - OTP after String conversion:", otpString);

        const isValid = user.verifyEmailOTP(otpString);
        console.log("VerifyEmail - OTP valid:", isValid);

        if (!isValid) {
            return res.status(400).json({ error: "Invalid OTP. Please try again." });
        }

        user.isEmailVerified = true;
        user.emailOTP = undefined;
        user.emailOTPExpires = undefined;
        await user.save();

        const token = JWT.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(200).json({
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }

        const otp = user.generateEmailOTP();
        await user.save();

        await sendVerificationEmail(email, otp);

        res.status(200).json({
            message: "Verification code sent successfully",
        });

    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



const me = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Me error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });

        // Don't reveal if user exists or not for security
        if (!user) {
            return res.status(200).json({ message: "If an account exists, a password reset code has been sent" });
        }

        const otp = user.generateEmailOTP();
        await user.save();

        const emailResult = await sendPasswordResetEmail(email, otp);

        if (!emailResult?.success) {
            console.error("Failed to send password reset email:", emailResult?.error);
        }

        res.status(200).json({ message: "If an account exists, a password reset code has been sent" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP, and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email }).select("+emailOTP +emailOTPExpires");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.emailOTP || !user.emailOTPExpires) {
            return res.status(400).json({ error: "No reset request found. Please request a new one." });
        }

        if (user.emailOTPExpires < new Date()) {
            return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
        }

        const isValid = user.verifyEmailOTP(otp);

        if (!isValid) {
            return res.status(400).json({ error: "Invalid reset code. Please try again." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.emailOTP = undefined;
        user.emailOTPExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    githubAuth,
    githubCallback: githubCallback,
    login,
    register,
    verifyEmail,
    resendOTP,
    getUserRepos,
    getUserCommits,
    me,
    logout,
    forgotPassword,
    resetPassword,
}