import config from './config.js';
import express from "express";
import cors from "cors";
import emailRoutes from "./src/routes/email.route.js";

const app = express();
const PORT = config.PORT;

app.use(cors({
    origin: config.SERVER_URI || "*",
}));
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const secret = req.headers["x-email-secret"];
    if (!secret || secret !== config.SECRET) {
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
