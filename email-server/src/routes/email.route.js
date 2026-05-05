import express from "express";
import {
    sendVerification,
    sendPasswordReset,
    sendErrorNotification,
    sendIncidentNotification,
} from "../services/email.service.js";

const router = express.Router();

router.post("/verify", async (req, res) => {
    try {
        const { to, otp } = req.body;
        if (!to || !otp) {
            return res.status(400).json({ error: "to and otp are required" });
        }
        const result = await sendVerification(to, otp);
        res.status(200).json(result);
    } catch (error) {
        console.error("[Email API] /verify error:", error);
        res.status(500).json({ error: "Failed to send verification email" });
    }
});

router.post("/password-reset", async (req, res) => {
    try {
        const { to, otp } = req.body;
        if (!to || !otp) {
            return res.status(400).json({ error: "to and otp are required" });
        }
        const result = await sendPasswordReset(to, otp);
        res.status(200).json(result);
    } catch (error) {
        console.error("[Email API] /password-reset error:", error);
        res.status(500).json({ error: "Failed to send password reset email" });
    }
});

router.post("/error-notification", async (req, res) => {
    try {
        const { to, serverName, errorDetails, isRecurring, solutionPrompt } = req.body;
        if (!to || !serverName || !errorDetails) {
            return res.status(400).json({ error: "to, serverName, and errorDetails are required" });
        }
        const result = await sendErrorNotification(to, serverName, errorDetails, isRecurring, solutionPrompt);
        res.status(200).json(result);
    } catch (error) {
        console.error("[Email API] /error-notification error:", error);
        res.status(500).json({ error: "Failed to send error notification" });
    }
});

router.post("/incident-notification", async (req, res) => {
    try {
        const { to, incident, organizationName, frontendUrl } = req.body;
        if (!to || !incident || !organizationName) {
            return res.status(400).json({ error: "to, incident, and organizationName are required" });
        }
        const result = await sendIncidentNotification(to, incident, organizationName, frontendUrl);
        res.status(200).json(result);
    } catch (error) {
        console.error("[Email API] /incident-notification error:", error);
        res.status(500).json({ error: "Failed to send incident notification" });
    }
});

export default router;
