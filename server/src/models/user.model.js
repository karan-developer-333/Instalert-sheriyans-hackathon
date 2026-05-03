import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enums: ["admin","user","organization"],
        default: "user",
    },
    working_score: {
        type: Number,
        default: 0,
    },
    score_last_reset: {
        type: Date,
        default: Date.now,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailOTP: {
        type: String,
    },
    emailOTPExpires: {
        type: Date,
    },
});

userSchema.methods.generateEmailOTP = async function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    this.emailOTP = await bcrypt.hash(otp, salt);
    this.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

userSchema.methods.verifyEmailOTP = async function (plainOTP) {
    if (!this.emailOTP || !this.emailOTPExpires) return false;
    if (this.emailOTPExpires < new Date()) return false;
    const match = await bcrypt.compare(plainOTP, this.emailOTP);
    return match;
};

const User = mongoose.model("User", userSchema);

export default User;
