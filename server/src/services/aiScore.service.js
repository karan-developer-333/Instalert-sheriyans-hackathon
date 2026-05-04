import MessageModel from "../models/message.model.js";
import UserModel from "../models/user.model.js";
import IncidentModel from "../models/incident.model.js";
import aiService from "./orgAI.service.js";

const SYSTEM_PROMPT = `You are an incident response evaluator. Analyze the following messages from an incident and assign a quality score (1-10) to each message based on:
- Relevance to the incident and its description
- Actionable information provided
- Professionalism and clarity
- Problem-solving contribution

Return ONLY a valid JSON array with no markdown formatting, no backticks, no code blocks. Format:
[{"message_id": "ID", "score": 8}, ...]

Score 0 means the message is irrelevant or spam. Score 10 means exceptional contribution.`;

export const scoreIncidentMessages = async (incidentId) => {
    try {
        const incident = await IncidentModel.findById(incidentId);
        if (!incident) {
            console.error("scoreIncidentMessages: Incident not found", incidentId);
            return;
        }

        const messages = await MessageModel.find({
            incident: incidentId,
            $or: [{ ai_score: 0 }, { ai_score: { $exists: false } }]
        }).select("_id sender content").lean();
        if (messages.length === 0) {
            console.log("scoreIncidentMessages: No unscored messages for incident", incidentId);
            return;
        }

        const context = messages.map((m) => `Message ${m._id} from user ${m.sender}:\n${m.content}`).join("\n\n");
        const userMessage = `Incident: "${incident.title}"\nDescription: ${incident.description}\n\nMessages to score:\n${context}`;

        const aiResponse = await aiService.askMistral(SYSTEM_PROMPT, userMessage);

        let scores;
        try {
            const cleaned = aiResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            scores = JSON.parse(cleaned);
        } catch {
            console.error("scoreIncidentMessages: Failed to parse AI response", aiResponse);
            return;
        }

        if (!Array.isArray(scores)) {
            console.error("scoreIncidentMessages: AI response is not an array", scores);
            return;
        }

        for (const s of scores) {
            if (!s.message_id || typeof s.score !== "number") continue;
            await MessageModel.findByIdAndUpdate(s.message_id, { ai_score: s.score });
        }

        const affectedUserIds = [...new Set(messages.map((m) => m.sender.toString()))];
        for (const userId of affectedUserIds) {
            await recalculateUserScore(userId);
        }

        console.log("scoreIncidentMessages: Scored messages for incident", incidentId);
    } catch (error) {
        console.error("scoreIncidentMessages error:", error);
    }
};

export const recalculateUserScore = async (userId) => {
    try {
        const messages = await MessageModel.find({ sender: userId }).select("ai_score").lean();
        const totalScore = messages.reduce((sum, m) => sum + (m.ai_score || 0), 0);
        await UserModel.findByIdAndUpdate(userId, { working_score: totalScore });
    } catch (error) {
        console.error("recalculateUserScore error:", error);
    }
};

export const handleMessageScoreUpdate = async (messageId, newContent) => {
    try {
        const message = await MessageModel.findById(messageId);
        if (!message) return;

        const oldScore = message.ai_score || 0;
        message.ai_score = 0;
        message.content = newContent;
        message.updatedAt = new Date();
        await message.save();

        await recalculateUserScore(message.sender);
    } catch (error) {
        console.error("handleMessageScoreUpdate error:", error);
    }
};

export const handleMessageScoreDelete = async (messageId) => {
    try {
        const message = await MessageModel.findById(messageId);
        if (!message) return;

        const oldScore = message.ai_score || 0;
        const userId = message.sender;

        await MessageModel.findByIdAndDelete(messageId);

        if (oldScore > 0) {
            const user = await UserModel.findById(userId);
            if (user) {
                user.working_score = Math.max(0, (user.working_score || 0) - oldScore);
                await user.save();
            }
        }
    } catch (error) {
        console.error("handleMessageScoreDelete error:", error);
    }
};

export const resetMonthlyScores = async () => {
    try {
        const now = new Date();
        await UserModel.updateMany({}, { working_score: 0, score_last_reset: now });
        await MessageModel.updateMany({}, { ai_score: 0 });
        console.log("resetMonthlyScores: All scores reset for", now.toISOString());
    } catch (error) {
        console.error("resetMonthlyScores error:", error);
    }
};

export default {
    scoreIncidentMessages,
    recalculateUserScore,
    handleMessageScoreUpdate,
    handleMessageScoreDelete,
    resetMonthlyScores,
};
