import OrganizationModel from "../models/organization.model.js"
import RefererModel from "../models/referer.model.js";
import userModel from "../models/user.model.js";

const createMyOrganization = async (req, res) => {
    try {
        const { organizationName } = req.body;
        const userId = req.user.id;

        if (!organizationName) {
            return res.status(400).json({ error: "Organization name is required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role === "organization") {
            return res.status(400).json({ error: "You already own an organization" });
        }

        const alreadyMember = await RefererModel.findOne({ referer: userId });
        if (alreadyMember) {
            return res.status(400).json({ error: "You are already a member of an organization" });
        }

        const alreadyOwns = await OrganizationModel.findOne({ owner: userId });
        if (alreadyOwns) {
            return res.status(400).json({ error: "You already own an organization" });
        }

        user.role = "organization";
        await user.save();

        const joinCode = `KALKI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newOrganization = await OrganizationModel.create({
            organizationName,
            organizationJoinCode: joinCode,
            owner: userId,
        });

        res.status(201).json({
            message: "Organization created successfully",
            organization: newOrganization,
            role: user.role,
        });
    } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const hasOrganization = async (req, res) => {
    try {
        const userId = req.user.id;

        const ownedOrg = await OrganizationModel.findOne({ owner: userId });
        if (ownedOrg) {
            return res.status(200).json({ hasOrganization: true, role: "organization" });
        }

        const memberRef = await RefererModel.findOne({ referer: userId }).populate("organization");
        if (memberRef) {
            return res.status(200).json({ hasOrganization: true, role: "member" });
        }

        res.status(200).json({ hasOrganization: false });
    } catch (error) {
        console.error("Error checking organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const joinOrganization = async (req, res) => {
    try {
        
        const { joinCode } = req.body;
        const userId = req.user.id;

        if (!joinCode) {
            return res.status(400).json({ error: "Join code is required" });
        }
    
        const organization = await OrganizationModel.findOne({ organizationJoinCode: joinCode }); 
        
        if (!organization) {
                return res.status(404).json({ error: "Join code is invalid" });
        }

        const existingReferer = await RefererModel.findOne({ organization: organization._id, referer: userId });

        if (existingReferer) {
            return res.status(400).json({ error: "User is already a member of this organization" });
        }

        const referer = await RefererModel.create({
                organization: organization._id,
                referer: userId,
        });

        return res.status(200).json({ message: "Successfully joined organization", referer });
    } catch (error) {
        console.error("Error joining organization:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default {
    createMyOrganization,
    hasOrganization,
    joinOrganization,
}
