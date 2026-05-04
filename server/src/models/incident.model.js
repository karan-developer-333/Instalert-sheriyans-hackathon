import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "closed"],
        default: "open",
    },
    notifiedAt: {
        type: Date,
    },
    source: {
        type: String,
        enum: ["manual", "auto-error"],
        default: "manual",
    },
    errorFingerprint: {
        type: String,
    },
    serverName: {
        type: String,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
});

const IncidentModel = mongoose.model("Incident", incidentSchema);

export default IncidentModel;