import OrganizationModel from "../models/organization.model.js";
import Referer from "../models/referer.model.js";
import UserModel from "../models/user.model.js";
import IncidentModel from "../models/incident.model.js";

// Get all employees/members of an organization
// Accessible by: organization owner, user, employee (any member of the org)
export const getEmployees = async (req, res) => {
    try {
        const userId = req.user._id;

        const userReferers = await Referer.find({ referer: userId })
            .populate('organization');

        const ownedOrgs = await OrganizationModel.find({ owner: userId });

        if ((!userReferers || userReferers.length === 0) && ownedOrgs.length === 0) {
            return res.status(404).json({ error: "No organizations found" });
        }

        const allMembers = [];
        const organizations = [];
        const processedOrgIds = new Set();

        for (const ref of userReferers) {
            const org = ref.organization;
            if (!org || processedOrgIds.has(org._id.toString())) continue;
            processedOrgIds.add(org._id.toString());

            const orgReferers = await Referer.find({ organization: org._id })
                .populate('referer', 'username email role');

            organizations.push({
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                isOwner: org.owner.toString() === userId.toString()
            });

            for (const memberRef of orgReferers) {
                allMembers.push({
                    _id: memberRef.referer._id,
                    username: memberRef.referer.username,
                    email: memberRef.referer.email,
                    role: memberRef.referer.role,
                    organizationRole: 'member',
                    organizationId: org._id,
                    organizationName: org.organizationName
                });
            }
        }

        for (const org of ownedOrgs) {
            if (processedOrgIds.has(org._id.toString())) continue;
            processedOrgIds.add(org._id.toString());

            const orgReferers = await Referer.find({ organization: org._id })
                .populate('referer', 'username email role');

            organizations.push({
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                isOwner: true
            });

            for (const memberRef of orgReferers) {
                if (memberRef.referer._id.toString() === userId.toString()) continue;
                allMembers.push({
                    _id: memberRef.referer._id,
                    username: memberRef.referer.username,
                    email: memberRef.referer.email,
                    role: memberRef.referer.role,
                    organizationRole: 'member',
                    organizationId: org._id,
                    organizationName: org.organizationName
                });
            }
        }

        res.status(200).json({
            message: "Employees fetched successfully",
            count: allMembers.length,
            members: allMembers,
            organizations
        });

    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get the organization that the current user belongs to
export const getMyOrg = async (req, res) => {
    try {
        const userId = req.user._id;

        let org = await OrganizationModel.findOne({ owner: userId }).populate('owner', 'username email role');
        let isOwner = !!org;

        if (!org) {
            const userReferer = await Referer.findOne({ referer: userId })
                .populate('organization');

            if (!userReferer) {
                return res.status(404).json({
                    error: "You don't belong to any organization",
                    message: "You need to join or create an organization first"
                });
            }

            org = userReferer.organization;
            isOwner = false;
        }

        const orgReferers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email role');

        const members = orgReferers
            .filter(ref => ref.referer._id.toString() !== userId.toString())
            .map(ref => ({
                _id: ref.referer._id,
                username: ref.referer.username,
                email: ref.referer.email,
                role: ref.referer.role
            }));

        res.status(200).json({
            message: "Organization fetched successfully",
            organization: {
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                owner: isOwner ? {
                    _id: org.owner._id,
                    username: org.owner.username,
                    email: org.owner.email,
                    role: org.owner.role
                } : null,
                members,
                memberCount: members.length
            },
            userRole: isOwner ? 'owner' : 'member'
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get own organization data - ONLY for users with role "organization"
export const getMyOwnOrganization = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole !== 'organization') {
            return res.status(403).json({
                error: "Access denied",
                message: "This route is only available for organization users"
            });
        }

        const organization = await OrganizationModel.findOne({ owner: userId })
            .populate('owner', 'username email role');

        if (!organization) {
            return res.status(404).json({
                error: "Organization not found",
                message: "You haven't created any organization yet"
            });
        }

        const orgReferers = await Referer.find({ organization: organization._id })
            .populate('referer', 'username email role');

        const members = orgReferers
            .filter(ref => ref.referer._id.toString() !== userId.toString())
            .map(ref => ({
                _id: ref.referer._id,
                username: ref.referer.username,
                email: ref.referer.email,
                role: ref.referer.role
            }));

        res.status(200).json({
            message: "Organization data fetched successfully",
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                organizationJoinCode: organization.organizationJoinCode,
                owner: {
                    _id: organization.owner._id,
                    username: organization.owner.username,
                    email: organization.owner.email,
                    role: organization.owner.role
                },
                members,
                memberCount: members.length
            },
            accessLevel: 'owner',
            isOwner: true
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Remove an employee from the organization (owner only)
export const removeEmployee = async (req, res) => {
    try {
        const { userId } = req.params;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) {
            return res.status(403).json({ error: "You do not own this organization" });
        }

        if (org.owner.toString() === userId) {
            return res.status(400).json({ error: "Cannot remove yourself" });
        }

        const removed = await Referer.findOneAndDelete({ referer: userId, organization: org._id });
        if (!removed) {
            return res.status(404).json({ error: "Employee not found in organization" });
        }

        res.status(200).json({ message: "Employee removed successfully" });
    } catch (error) {
        console.error("Error removing employee:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get leaderboard - top 10 users by working_score in the owner's org (excludes owner)
export const getLeaderboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const org = await OrganizationModel.findOne({ owner: userId });
        if (!org) {
            return res.status(403).json({ error: "You do not own this organization" });
        }

        const now = new Date();
        if (now.getDate() === 1 && org.score_last_reset && now.getMonth() !== new Date(org.score_last_reset).getMonth()) {
            UserModel.updateMany({}, { working_score: 0, score_last_reset: now });
        }

        const referers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email working_score')
            .sort({ 'referer.working_score': -1 })
            .limit(10);

        const leaderboard = referers.map((ref, index) => ({
            rank: index + 1,
            userId: ref.referer._id,
            username: ref.referer.username,
            email: ref.referer.email,
            working_score: ref.referer.working_score || 0,
        }));

        res.status(200).json({
            message: "Leaderboard fetched successfully",
            leaderboard,
            month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get incident stats: incidents per day (last 7 days) + today's top 5 recent incidents
export const getIncidentStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const org = await OrganizationModel.findOne({ owner: userId });
        if (!org) {
            return res.status(403).json({ error: "You do not own this organization" });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const incidents = await IncidentModel.find({
            organization: org._id,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 });

        const incidentsByDay = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const key = date.toISOString().split('T')[0];
            incidentsByDay[key] = { date: key, count: 0 };
        }

        for (const incident of incidents) {
            const key = incident.createdAt.toISOString().split('T')[0];
            if (incidentsByDay[key]) {
                incidentsByDay[key].count++;
            }
        }

        const today = now.toISOString().split('T')[0];
        const todayIncidents = incidents
            .filter(inc => inc.createdAt.toISOString().split('T')[0] === today)
            .slice(0, 5)
            .map(inc => ({
                _id: inc._id,
                title: inc.title,
                status: inc.status,
                createdAt: inc.createdAt,
            }));

        const chartData = Object.values(incidentsByDay);

        res.status(200).json({
            message: "Incident stats fetched successfully",
            chartData,
            recentIncidents: todayIncidents,
        });

    } catch (error) {
        console.error("Error fetching incident stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    getEmployees,
    getMyOrg,
    getMyOwnOrganization,
    removeEmployee,
    getLeaderboard,
    getIncidentStats,
};
