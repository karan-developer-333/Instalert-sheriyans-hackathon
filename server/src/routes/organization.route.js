import express from "express";
import validateUser from "../middlewares/validateUser.middleware.js";
import { getEmployees, getMyOrg, getMyOwnOrganization, removeEmployee, getLeaderboard, getIncidentStats } from "../controllers/organization.controller.js";
import orgAIController from "../controllers/orgAI.controller.js";
import validateAccessMiddleware from "../middlewares/validateAccess.middleware.js";

const router = express.Router();

/*
    @route GET /organization/get-employees
    @desc Get all employees/members of organizations the user belongs to
    @access Private
    @roles organization, user, employee
*/
router.get("/get-employees", validateUser, getEmployees);

/*
    @route GET /organization/get-my-org
    @desc Get the current user's organization
    @access Private
*/
router.get("/get-my-org", validateUser, getMyOrg);

/*
    @route GET /organization/get-my-own-org
    @desc Get own organization data - ONLY for organization owners
    @access Private
    @roles organization (owner only)
*/
router.get("/get-my-own-org", validateUser,validateAccessMiddleware.validateOrganization, getMyOwnOrganization);

/*
    @route DELETE /organization/remove-employee/:userId
    @desc Remove an employee from organization (owner only)
    @access Private
    @roles organization (owner only)
*/
router.delete("/remove-employee/:userId", validateUser, validateAccessMiddleware.validateOrganization, removeEmployee);

/*
    @route GET /organization/dashboard
    @desc Welcome message for organization dashboard
    @access Private
*/
router.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the organization dashboard!" });
});

/*
    @route GET /organization/leaderboard
    @desc Get top 10 users by working_score (excludes owner)
    @access Private (owner only)
*/
router.get("/leaderboard", validateUser, validateAccessMiddleware.validateOrganization, getLeaderboard);

/*
    @route GET /organization/incident-stats
    @desc Get incidents per day (7 days) + today's top 5 recent incidents
    @access Private (owner only)
*/
router.get("/incident-stats", validateUser, validateAccessMiddleware.validateOrganization, getIncidentStats);

/*
    @route POST /organization/ai-assistant
    @desc AI assistant for org management queries and suggestions
    @access Private (org owner only)
*/
router.post("/ai-assistant", validateUser, validateAccessMiddleware.validateOrganization, orgAIController.orgAIAssistant);

/*
    @route POST /organization/ai-execute-action
    @desc Execute an action suggested by org AI assistant
    @access Private (org owner only)
*/
router.post("/ai-execute-action", validateUser, validateAccessMiddleware.validateOrganization, orgAIController.executeOrgAIAction);

export default router;
