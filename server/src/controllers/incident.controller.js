import IncidentModel from "../models/incident.model.js";
import OrganizationModel from "../models/organization.model.js";
import Referer from "../models/referer.model.js";
import MessageModel from "../models/message.model.js";

import aiService from "../services/orgAI.service.js";
import aiScoreService from "../services/aiScore.service.js";
import { io } from "../socket/socket.js";
import { sendIncidentNotification } from "../services/email-client.js";

// Get all incidents for organizations the user belongs to (with pagination)
export const getIncidents = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });

        const orgIds = userReferers.map(ref => ref.organization);
        ownedOrgs.forEach(org => {
            if (!orgIds.some(id => id.toString() === org._id.toString())) {
                orgIds.push(org._id);
            }
        });

        if (orgIds.length === 0) {
            return res.status(200).json({
                message: "No incidents found",
                incidents: [],
                pagination: { currentPage: 1, totalPages: 0, totalCount: 0 }
            });
        }

        const totalCount = await IncidentModel.countDocuments({
            organization: { $in: orgIds }
        });

        const incidents = await IncidentModel.find({
            organization: { $in: orgIds }
        }).sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            message: "Incidents fetched successfully",
            incidents,
            pagination: { currentPage: page, totalPages, totalCount }
        });

    } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a new incident
export const createIncident = async (req, res) => {
    try {
        const { title, description, organizationId } = req.body;

        if (!title || !description || !organizationId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const org = await OrganizationModel.findOne({ owner: req.user._id, _id: organizationId });
        if (!org) {
            return res.status(403).json({ error: "You do not own this organization" });
        }

        const incident = await IncidentModel.create({ title, description, organization: organizationId });

        // Schedule email notification after 10 seconds if no reports submitted
        setTimeout(async () => {
            try {
                const freshIncident = await IncidentModel.findById(incident._id);
                if (!freshIncident) return;

                const messageCount = await MessageModel.countDocuments({ incident: freshIncident._id });
                if (messageCount > 0) return;
                if (freshIncident.notifiedAt) return;

                // Fetch all employees in the organization
                const orgReferers = await Referer.find({ organization: organizationId }).populate('referer', 'email username');
                const owner = await OrganizationModel.findById(organizationId).populate('owner', 'email');

                const allEmails = [];
                if (owner?.owner?.email) allEmails.push(owner.owner.email);
                orgReferers.forEach(ref => {
                    if (ref.referer?.email && !allEmails.includes(ref.referer.email)) {
                        allEmails.push(ref.referer.email);
                    }
                });

                // Send email to all employees
                for (const email of allEmails) {
                    await sendIncidentNotification(email, freshIncident, org.organizationName);
                }

                freshIncident.notifiedAt = new Date();
                await freshIncident.save();
                console.log(`[Email] Incident notification sent to ${allEmails.length} employees`);
            } catch (err) {
                console.error("[Email] Error sending incident notification:", err);
            }
        }, 10000);

        res.status(201).json({ message: "Incident created successfully", incident });
    } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get single incident by ID
export const getIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = req.user._id;
        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(404).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: id, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }

        res.status(200).json({ message: "Incident fetched successfully", incident });
    } catch (error) {
        console.error("Error fetching incident:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update an incident
export const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) return res.status(403).json({ error: "You do not own this organization" });

        const incident = await IncidentModel.findOne({ _id: id, organization: org._id });
        if (!incident) return res.status(404).json({ error: "Incident not found" });

        if (title !== undefined) incident.title = title;
        if (description !== undefined) incident.description = description;
        if (status !== undefined) {
            if (!["open", "in_progress", "closed"].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            incident.status = status;
        }
        await incident.save();

        if (org?.organizationJoinCode) {
          io.to(`org:${org.organizationJoinCode}`).emit("incident-updated", JSON.stringify({
            _id: incident._id,
            status: incident.status,
            title: incident.title,
            description: incident.description,
          }));
        }

        res.status(200).json({ message: "Incident updated successfully", incident });
    } catch (error) {
        console.error("Error updating incident:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete an incident
export const deleteIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) return res.status(403).json({ error: "You do not own this organization" });

        const incident = await IncidentModel.findOne({ _id: id, organization: org._id });
        if (!incident) return res.status(404).json({ error: "Incident not found" });

        await MessageModel.deleteMany({ incident: id });
        await IncidentModel.deleteOne({ _id: id });

        if (org.organizationJoinCode) {
          io.to(`org:${org.organizationJoinCode}`).emit("incident-deleted", JSON.stringify({ _id: id }));
        }

        res.status(200).json({ message: "Incident deleted successfully" });
    } catch (error) {
        console.error("Error deleting incident:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Close an incident (owner only) - triggers AI scoring
export const closeIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) return res.status(403).json({ error: "You do not own this organization" });

        const incident = await IncidentModel.findOne({ _id: id, organization: org._id });
        if (!incident) return res.status(404).json({ error: "Incident not found" });

        if (incident.status === "closed") {
            return res.status(400).json({ error: "Incident is already closed" });
        }

        incident.status = "closed";
        await incident.save();

        if (org?.organizationJoinCode) {
          io.to(`org:${org.organizationJoinCode}`).emit("incident-updated", JSON.stringify({
            _id: incident._id,
            status: incident.status,
          }));
        }

        aiScoreService.scoreIncidentMessages(id);

        res.status(200).json({ message: "Incident closed successfully", incident });
    } catch (error) {
        console.error("Error closing incident:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all messages for an incident
export const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(403).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: id, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found or no access" });
        }

        const messages = await MessageModel.find({ incident: id })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 });

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            sender: msg.sender?.username || "Unknown",
            senderId: msg.sender?._id,
            createdAt: msg.createdAt,
            incidentId: msg.incident,
            ai_score: msg.ai_score || 0,
        }));

        res.status(200).json({
            message: "Messages fetched successfully",
            messages: formattedMessages,
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// AI summarize an incident
export const aiSummarize = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(403).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: id, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found or no access" });
        }

        const messages = await MessageModel.find({ incident: id })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 });

        const messagesText = messages.map(m => `[${new Date(m.createdAt).toLocaleString()}] ${m.sender?.username || "Unknown"}: ${m.content}`).join("\n");

        const systemPrompt = `You are an AI incident analysis assistant. Analyze the following incident and its report messages. Provide a concise summary that includes:
1. Incident overview
2. Key issues reported
3. Current status assessment
Keep it brief and professional.`;

        const userMessage = `Incident: "${incident.title}"\nDescription: ${incident.description}\nStatus: ${incident.status}\n\nReport Messages:\n${messagesText || "No reports yet."}`;

        const summary = await aiService.askMistral(systemPrompt, userMessage);

        res.status(200).json({
            message: "AI summary generated successfully",
            summary,
        });

    } catch (error) {
        console.error("Error generating AI summary:", error);
        res.status(500).json({ error: "Failed to generate AI summary" });
    }
};

// AI answer question about an incident
export const aiAsk = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ error: "Question is required" });
        }

        const userId = req.user._id;

        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(403).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: id, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found or no access" });
        }

        const messages = await MessageModel.find({ incident: id })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 });

        const messagesText = messages.map(m => `[${new Date(m.createdAt).toLocaleString()}] ${m.sender?.username || "Unknown"}: ${m.content}`).join("\n");

        const systemPrompt = `You are an AI incident analysis assistant. You have access to the following incident details and report messages. Answer the user's question based on the available information. If you cannot find relevant information, say so clearly. Be concise and helpful.`;

        const userMessage = `Incident: "${incident.title}"\nDescription: ${incident.description}\nStatus: ${incident.status}\nCreated: ${incident.createdAt}\n\nReport Messages:\n${messagesText || "No reports yet."}\n\nUser's Question: ${question}`;

        const answer = await aiService.askMistral(systemPrompt, userMessage);

        res.status(200).json({
            message: "AI answer generated successfully",
            answer,
        });

    } catch (error) {
        console.error("Error generating AI answer:", error);
        res.status(500).json({ error: "Failed to generate AI answer" });
    }
};

// Toggle incident status (owner only) - open <-> closed
export const toggleIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) return res.status(403).json({ error: "You do not own this organization" });

        const incident = await IncidentModel.findOne({ _id: id, organization: org._id });
        if (!incident) return res.status(404).json({ error: "Incident not found" });

        const isOwner = org.owner.toString() === req.user._id.toString();
        if (!isOwner) return res.status(403).json({ error: "Only the organization owner can toggle status" });

        if (incident.status === "closed") {
            incident.status = "open";
        } else {
            incident.status = "closed";
            aiScoreService.scoreIncidentMessages(incident._id);
        }
        await incident.save();

        if (org?.organizationJoinCode) {
            io.to(`org:${org.organizationJoinCode}`).emit("incident-updated", JSON.stringify({
                _id: incident._id,
                status: incident.status,
            }));
        }

        res.status(200).json({ message: "Incident status toggled successfully", incident });
    } catch (error) {
        console.error("Error toggling incident status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a message (sender only)
export const updateMessage = async (req, res) => {
    try {
        const { id: incidentId, messageId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: "Content is required" });
        }

        const userId = req.user._id;
        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(403).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: incidentId, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found or no access" });
        }

        const message = await MessageModel.findOne({ _id: messageId, incident: incidentId, sender: userId });
        if (!message) {
            return res.status(403).json({ error: "Message not found or you don't have permission to edit it" });
        }

        const oldScore = message.ai_score || 0;
        message.ai_score = 0;
        message.content = content.trim();
        message.updatedAt = new Date();
        await message.save();

        aiScoreService.recalculateUserScore(userId);

        const org = await OrganizationModel.findOne({ _id: incident.organization });
        if (org?.organizationJoinCode) {
            io.to(`org:${org.organizationJoinCode}`).emit("message-updated", JSON.stringify({
                _id: message._id,
                content: message.content,
                incidentId: message.incident,
                updatedAt: message.updatedAt,
            }));
        }

        res.status(200).json({ message: "Message updated successfully", message });
    } catch (error) {
        console.error("Error updating message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a message (sender only)
export const deleteMessage = async (req, res) => {
    try {
        const { id: incidentId, messageId } = req.params;

        const userId = req.user._id;
        const userReferers = await Referer.find({ referer: userId });
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        const orgIds = [...userReferers.map(r => r.organization), ...ownedOrgs.map(o => o._id)];

        if (orgIds.length === 0) {
            return res.status(403).json({ error: "No organizations found" });
        }

        const incident = await IncidentModel.findOne({ _id: incidentId, organization: { $in: orgIds } });
        if (!incident) {
            return res.status(404).json({ error: "Incident not found or no access" });
        }

        const message = await MessageModel.findOne({ _id: messageId, incident: incidentId, sender: userId });
        if (!message) {
            return res.status(403).json({ error: "Message not found or you don't have permission to delete it" });
        }

        aiScoreService.handleMessageScoreDelete(messageId);

        const org = await OrganizationModel.findOne({ _id: incident.organization });
        if (org?.organizationJoinCode) {
            io.to(`org:${org.organizationJoinCode}`).emit("message-deleted", JSON.stringify({
                _id: messageId,
                incidentId,
            }));
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    getIncidents,
    createIncident,
    getIncident,
    updateIncident,
    deleteIncident,
    closeIncident,
    toggleIncidentStatus,
    getMessages,
    updateMessage,
    deleteMessage,
    aiSummarize,
    aiAsk,
};
