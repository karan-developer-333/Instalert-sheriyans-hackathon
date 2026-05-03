import bcrypt from "bcryptjs";

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

export const verifyOTP = async (hashedOTP, plainOTP) => {
    return await bcrypt.compare(plainOTP, hashedOTP);
};
