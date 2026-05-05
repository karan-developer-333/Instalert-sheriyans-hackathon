import OrganizationModel from "../models/organization.model.js";
import IncidentModel from "../models/incident.model.js";
import Referer from "../models/referer.model.js";
import UserModel from "../models/user.model.js";
import orgAIService from "../services/orgAI.service.js";

export const orgAIAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Message is required" });
        }

        const userId = req.user._id;

        const org = await OrganizationModel.findOne({ owner: userId });
        if (!org) {
            return res.status(403).json({ error: "You do not own an organization" });
        }

        const orgReferers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email role working_score');

        const members = orgReferers.map(ref => ({
            _id: ref.referer._id.toString(),
            username: ref.referer.username,
            email: ref.referer.email,
            role: ref.referer.role,
            working_score: ref.referer.working_score || 0,
            status: ref.referer.status || 'active',
        }));

        const totalIncidents = await IncidentModel.countDocuments({ organization: org._id });

        const recentIncidents = await IncidentModel.find({ organization: org._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title status createdAt');

        const orgContext = {
            orgName: org.organizationName,
            ownerName: req.user.username,
            joinCode: org.organizationJoinCode,
            members,
            recentIncidents: recentIncidents.map(inc => ({
                title: inc.title,
                status: inc.status,
                createdAt: new Date(inc.createdAt).toLocaleDateString(),
            })),
            totalIncidents,
        };

        const result = await orgAIService.analyzeOrgRequest(message.trim(), orgContext);

        res.status(200).json({
            message: "AI response generated successfully",
            response: result.response,
            suggestedAction: result.suggestedAction,
            proposals: result.proposals,
        });

    } catch (error) {
        console.error("Error in orgAIAssistant:", error);
        res.status(500).json({ error: "Failed to generate AI response" });
    }
};

export const getAISuggestions = async (req, res) => {
    try {
        const userId = req.user._id;

        const org = await OrganizationModel.findOne({ owner: userId });
        if (!org) {
            return res.status(403).json({ error: "You do not own an organization" });
        }

        const orgReferers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email role working_score');

        const members = orgReferers.map(ref => ({
            _id: ref.referer._id.toString(),
            username: ref.referer.username,
            email: ref.referer.email,
            role: ref.referer.role,
            working_score: ref.referer.working_score || 0,
            status: ref.referer.status || 'active',
        }));

        const totalIncidents = await IncidentModel.countDocuments({ organization: org._id });

        const recentIncidents = await IncidentModel.find({ organization: org._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title status createdAt');

        const orgContext = {
            orgName: org.organizationName,
            ownerName: req.user.username,
            joinCode: org.organizationJoinCode,
            members,
            recentIncidents: recentIncidents.map(inc => ({
                title: inc.title,
                status: inc.status,
                createdAt: new Date(inc.createdAt).toLocaleDateString(),
            })),
            totalIncidents,
        };

        const suggestions = await orgAIService.generateSuggestions(orgContext);

        res.status(200).json({
            message: "AI suggestions generated successfully",
            suggestions,
        });
    } catch (error) {
        console.error("Error in getAISuggestions:", error);
        res.status(500).json({ error: "Failed to generate AI suggestions" });
    }
};

export const executeOrgAIAction = async (req, res) => {
    try {
        const { actionType, params } = req.body;

        if (!actionType || !params) {
            return res.status(400).json({ error: "actionType and params are required" });
        }

        const userId = req.user._id;

        const org = await OrganizationModel.findOne({ owner: userId });
        if (!org) {
            return res.status(403).json({ error: "You do not own an organization" });
        }

        if (actionType === "create_incident") {
            if (!params.title || !params.description) {
                return res.status(400).json({ error: "title and description are required for create_incident" });
            }

            const incident = await IncidentModel.create({
                title: params.title,
                description: params.description,
                severity: params.severity || "medium",
                organization: org._id,
                createdBy: userId,
            });

            return res.status(201).json({
                message: "Incident created successfully",
                actionType: "create_incident",
                incident,
            });
        }

        if (actionType === "remove_user") {
            if (!params.userId) {
                return res.status(400).json({ error: "userId is required for remove_user" });
            }

            const removed = await Referer.findOneAndDelete({
                referer: params.userId,
                organization: org._id,
            });

            if (!removed) {
                return res.status(404).json({ error: "User not found in organization" });
            }

            return res.status(200).json({
                message: "User removed successfully",
                actionType: "remove_user",
            });
        }

        res.status(400).json({ error: "Invalid action type" });
    } catch (error) {
        console.error("Error executing org AI action:", error);
        res.status(500).json({ error: "Failed to execute action" });
    }
};

export default {
    orgAIAssistant,
    executeOrgAIAction,
    getAISuggestions,
};
