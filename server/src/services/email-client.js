import axios from "axios";
import { config } from "dotenv";
config();

const EMAIL_SERVER_URL = process.env.EMAIL_SERVER_URL || "http://localhost:3002";
const EMAIL_SERVER_SECRET = process.env.EMAIL_SERVER_SECRET || "";

const api = axios.create({
    baseURL: EMAIL_SERVER_URL,
    headers: {
        "x-email-secret": EMAIL_SERVER_SECRET,
    },
    timeout: 15000,
});


export const sendVerificationEmail = async (to, otp) => {
    try {
        const { data } = await api.post("/api/email/verify", { to, otp });
        return data;
    } catch (error) {
        console.error("[Email Client] sendVerificationEmail failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.error || error.message };
    }
};

export const sendPasswordResetEmail = async (to, otp) => {
    try {
        const { data } = await api.post("/api/email/password-reset", { to, otp });
        return data;
    } catch (error) {
        console.error("[Email Client] sendPasswordResetEmail failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.error || error.message };
    }
};

export const sendErrorNotification = async (to, serverName, errorDetails, isRecurring, solutionPrompt) => {
    try {
        const { data } = await api.post("/api/email/error-notification", {
            to,
            serverName,
            errorDetails,
            isRecurring,
            solutionPrompt,
        });
        return data;
    } catch (error) {
        console.error("[Email Client] sendErrorNotification failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.error || error.message };
    }
};

export const sendIncidentNotification = async (to, incident, organizationName) => {
    try {
        const { data } = await api.post("/api/email/incident-notification", {
            to,
            incident,
            organizationName,
            frontendUrl: process.env.FRONTEND_URL,
        });
        return data;
    } catch (error) {
        console.error("[Email Client] sendIncidentNotification failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.error || error.message };
    }
};
