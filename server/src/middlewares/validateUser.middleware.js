
import UserModel from "../models/user.model.js";
import JWT from "jsonwebtoken";
import configObj from "../config/config.js";

const validateUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = JWT.verify(token, configObj.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = user;

    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }


    next();
};

export default validateUser;