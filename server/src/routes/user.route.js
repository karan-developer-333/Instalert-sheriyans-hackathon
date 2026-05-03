import express from "express";
import userController from "../controllers/user.controller.js";
import validateUser from "../middlewares/validateUser.middleware.js";

const router = express.Router();

/*
    @route POST /user/create-organization
    @desc Create an organization (self-service, logged-in user becomes owner)
    @access Private
*/
router.post("/create-organization", validateUser, userController.createMyOrganization);

/*
    @route GET /user/has-organization
    @desc Check if user is a member or owner of any organization
    @access Private
*/
router.get("/has-organization", validateUser, userController.hasOrganization);

/*
    @route POST /user/join-organization
    @desc Join an organization using invite code
    @access Private
*/
router.post("/join-organization", validateUser, userController.joinOrganization);

export default router;
