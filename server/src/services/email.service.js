import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

const createTransporter = () => {
    if (process.env.GOOGLE_REFESH_TOKEN && process.env.GOOGLE_CLINT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_USER) {
        return nodemailer.createTransport({
            service: "Gmail",
            auth: {
                type: "OAuth2",
                user: process.env.GOOGLE_USER,
                clientId: process.env.GOOGLE_CLINT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFESH_TOKEN,
            },
        });
    }

    return nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_FROM || process.env.GOOGLE_USER,
            pass: process.env.EMAIL_PASSWORD || "",
        },
    });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const from = process.env.EMAIL_FROM || process.env.GOOGLE_USER || "noreply@instaalert.com";
        const info = await transporter.sendMail({
            from: `"InstaAlert" <${from}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
    }
};

export const sendVerificationEmail = async (to, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F7F5F3; border-radius: 12px; border: 1px solid rgba(55,50,47,0.12);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: 'Instrument Serif', serif; color: #37322F; font-size: 24px; margin: 0;">InstaAlert</h1>
        <p style="color: #605A57; font-size: 14px; margin: 4px 0 0;">Email Verification</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px; text-align: center;">
        <p style="color: #49423D; font-size: 14px; margin: 0 0 16px;">Use the code below to verify your email address:</p>
        <div style="display: inline-block; background: #37322F; color: white; font-size: 28px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #605A57; font-size: 12px; margin: 16px 0 0;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
      <p style="color: #605A57; font-size: 12px; text-align: center; margin: 16px 0 0;">© 2026 InstaAlert. All rights reserved.</p>
    </div>
    `;
    return sendEmail({ to, subject: "Verify your email - InstaAlert", html });
};

export const sendIncidentNotification = async (to, incident, organizationName) => {
    const incidentUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard/incidents/${incident._id}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F7F5F3; border-radius: 12px; border: 1px solid rgba(55,50,47,0.12);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: 'Instrument Serif', serif; color: #37322F; font-size: 24px; margin: 0;">InstaAlert</h1>
        <p style="color: #605A57; font-size: 14px; margin: 4px 0 0;">New Incident Alert</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="background: #FEE2E2; color: #DC2626; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;">OPEN</span>
          <span style="color: #605A57; font-size: 12px;">0 reports yet</span>
        </div>
        <h2 style="color: #37322F; font-size: 18px; margin: 0 0 8px; font-family: 'Instrument Serif', serif;">${incident.title}</h2>
        <p style="color: #49423D; font-size: 14px; margin: 0 0 16px; line-height: 1.5;">${incident.description?.length > 200 ? incident.description.substring(0, 200) + "..." : incident.description}</p>
        <div style="display: flex; gap: 16px; font-size: 12px; color: #605A57; margin-bottom: 16px;">
          <span>📂 Organization: ${organizationName}</span>
          <span>🕐 ${new Date(incident.createdAt).toLocaleString()}</span>
        </div>
        <a href="${incidentUrl}" style="display: block; background: #37322F; color: white; text-decoration: none; text-align: center; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600;">View Incident & Submit Report</a>
      </div>
      <p style="color: #605A57; font-size: 12px; text-align: center; margin: 16px 0 0;">Please submit your report ASAP. No reports have been submitted yet.</p>
      <p style="color: #605A57; font-size: 12px; text-align: center; margin: 8px 0 0;">© 2026 InstaAlert. All rights reserved.</p>
    </div>
    `;
    return sendEmail({ to, subject: `🔔 New Incident: ${incident.title}`, html });
};
