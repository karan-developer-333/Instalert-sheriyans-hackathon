import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import emailRoutes from "./src/routes/email.route.js";

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3002;

app.use(cors({
    origin: process.env.SERVER_URI || "*",
}));
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const secret = req.headers["x-email-secret"];
    if (!secret || secret !== process.env.EMAIL_SERVER_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "instalert-email-server" });
});

app.use("/api/email", authMiddleware, emailRoutes);

app.listen(PORT, () => {
    console.log(`[Email Server] Running on port ${PORT}`);
});
