import mongoose from "mongoose";
import crypto from "crypto";

function hashOTP(otp) {
    return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

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
        select: false,
    },
    emailOTPExpires: {
        type: Date,
        select: false,
    },
});

userSchema.methods.generateEmailOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailOTP = hashOTP(otp);
    this.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

userSchema.methods.verifyEmailOTP = function (plainOTP) {
    if (!this.emailOTP || !this.emailOTPExpires) return false;
    if (this.emailOTPExpires < new Date()) return false;
    return this.emailOTP === hashOTP(String(plainOTP));
};

const User = mongoose.model("User", userSchema);

export default User;
