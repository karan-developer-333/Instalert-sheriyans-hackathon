import nodemailer from "nodemailer";
import { config } from "dotenv";
import { marked } from "marked";
config();

const markdownStyles = `
<style>
  .markdown-body { font-size: 13px; color: #49423D; line-height: 1.5; font-family: Arial, sans-serif; }
  .markdown-body p { margin: 0 0 12px 0; }
  .markdown-body p:last-child { margin-bottom: 0; }
  .markdown-body strong { color: #37322F; font-weight: 600; }
  .markdown-body ul, .markdown-body ol { margin: 0 0 12px 0; padding-left: 20px; }
  .markdown-body li { margin-bottom: 4px; }
  .markdown-body code { background: rgba(55,50,47,0.08); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px; }
  .markdown-body pre { background: rgba(55,50,47,0.08); padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 11px; margin: 0 0 12px 0; }
  .markdown-body pre code { background: transparent; padding: 0; }
</style>
`;
const createTransporter = () => {
    if (process.env.GOOGLE_REFESH_TOKEN && process.env.GOOGLE_CLINT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_USER) {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 465,              
            secure: true,           
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
        host: 'smtp.gmail.com', 
        port: 465,              
        secure: true,           
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

export const sendErrorNotification = async (to, serverName, errorDetails, isRecurring, solutionPrompt) => {
    const { errorMessage, stackTrace, endpoint, statusCode, severity } = errorDetails;
    
    const severityColors = {
        low: { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7' },
        medium: { bg: '#FFFBEB', text: '#B45309', border: '#FEF3C7' },
        high: { bg: '#FFF1F2', text: '#BE123C', border: '#FFE4E6' },
        critical: { bg: '#450A0A', text: '#FFFFFF', border: '#000000' }
    };

    const colors = severityColors[severity?.toLowerCase()] || severityColors.medium;
    const subject = isRecurring
        ? `⚠️ Recurring Error [${severity?.toUpperCase() || 'MEDIUM'}] on ${serverName}`
        : `🚨 New Error [${severity?.toUpperCase() || 'MEDIUM'}] on ${serverName}`;

    const html = `
    ${markdownStyles}
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFCFB; border-radius: 16px; border: 1px solid rgba(55,50,47,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #37322F; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">InstaAlert</h1>
        <p style="color: #605A57; font-size: 14px; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          ${isRecurring ? 'Recurring Incident Report' : 'New Incident Detected'}
        </p>
      </div>

      <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(55,50,47,0.08); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div style="display: flex; gap: 8px;">
            <span style="background: ${isRecurring ? '#F3E8FF; color: #7E22CE' : '#FEE2E2; color: #DC2626'}; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">
                ${isRecurring ? 'RECURRING' : 'NEW'}
            </span>
            <span style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border}; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">
                ${severity?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
        </div>

        <h2 style="color: #1A1715; font-size: 20px; margin: 0 0 16px; line-height: 1.4; font-weight: 700;">${errorMessage}</h2>
        
        <div style="background: #F8F9FA; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #37322F;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; color: #4B5563;">
            <div style="margin-bottom: 4px;"><strong>🖥️ Server:</strong> ${serverName}</div>
            ${endpoint ? `<div style="margin-bottom: 4px;"><strong>🔗 Endpoint:</strong> ${endpoint}</div>` : ''}
            ${statusCode ? `<div style="margin-bottom: 4px;"><strong>📊 Status:</strong> ${statusCode}</div>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 24px;" class="markdown-body">
          <h3 style="color: #37322F; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">🔍 AI Diagnostic Analysis</h3>
          ${marked.parse(stackTrace || 'No detailed analysis available.')}
        </div>

        ${solutionPrompt ? `
        <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 10px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 20px;">🪄</span>
            <strong style="color: #0369A1; font-size: 15px;">Direct Fix Prompt</strong>
          </div>
          <p style="color: #0E7490; font-size: 12px; margin: 0 0 12px; line-height: 1.5;">
            Copy the prompt below into an AI tool (ChatGPT/Claude) to get a production-ready solution:
          </p>
          <div style="background: #0F172A; color: #F1F5F9; padding: 16px; border-radius: 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.6; white-space: pre-wrap; word-break: break-all;">${solutionPrompt}</div>
          <div style="margin-top: 12px; text-align: right;">
            <span style="font-size: 10px; color: #64748B; font-style: italic;">Powered by InstaAlert AI Engine</span>
          </div>
        </div>` : ''}
      </div>

      <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 11px;">
        <p style="margin-bottom: 4px;">You received this because error reporting is enabled for your organization.</p>
        <p>© 2026 InstaAlert Inc. • Secure Incident Management</p>
      </div>
    </div>
    `;
    return sendEmail({ to, subject, html });
};

export const sendPasswordResetEmail = async (to, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F7F5F3; border-radius: 12px; border: 1px solid rgba(55,50,47,0.12);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: 'Instrument Serif', serif; color: #37322F; font-size: 24px; margin: 0;">InstaAlert</h1>
        <p style="color: #605A57; font-size: 14px; margin: 4px 0 0;">Password Reset</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px; text-align: center;">
        <p style="color: #49423D; font-size: 14px; margin: 0 0 16px;">Use the code below to reset your password:</p>
        <div style="display: inline-block; background: #37322F; color: white; font-size: 28px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #605A57; font-size: 12px; margin: 16px 0 0;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
      <p style="color: #605A57; font-size: 12px; text-align: center; margin: 16px 0 0;">© 2026 InstaAlert. All rights reserved.</p>
    </div>
    `;
    return sendEmail({ to, subject: "Reset your password - InstaAlert", html });
};

export const sendIncidentNotification = async (to, incident, organizationName) => {
    const incidentUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard/incidents/${incident._id}`;
    const html = `
    ${markdownStyles}
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
        <div style="background: #F7F5F3; padding: 16px; border-radius: 8px; margin-bottom: 16px;" class="markdown-body">
          ${marked.parse(incident.description?.length > 400 ? incident.description.substring(0, 400) + "..." : (incident.description || ""), { breaks: true })}
        </div>
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
