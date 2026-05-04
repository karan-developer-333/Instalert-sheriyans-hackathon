import express from 'express';
import authController from '../controllers/auth.controller.js';
import validateUser from '../middlewares/validateUser.middleware.js';

const router = express.Router();


/*
    @route GET /auth/github
    @desc Redirect to GitHub for authentication
    @access Public
*/
router.get('/github', authController.githubAuth);

/*
    @route GET /auth/github/callback
    @desc Handle GitHub OAuth callback and generate JWT token
    @access Public
 */
router.get('/github/callback', authController.githubCallback);

/*
    @route POST /auth/login
    @desc Login user and return JWT token
    @access Public
*/
router.post('/login', authController.login);

/*
    @route POST /auth/register
    @desc Register a new user
    @access Public
*/
router.post('/register', authController.register);

/*
    @route GET /auth/repos
    @desc Get all repositories for authenticated user
    @access Private
*/
router.get('/repos', authController.getUserRepos);

/*
    @route GET /auth/commits
    @desc Get commits for all or specific repository
    @access Private
*/
router.get('/commits', authController.getUserCommits);

/*
    @route POST /auth/verify-email
    @desc Verify email with OTP
    @access Public
*/
router.post('/verify-email', authController.verifyEmail);

/*
    @route POST /auth/resend-otp
    @desc Resend OTP to email
    @access Public
 */
router.post('/resend-otp', authController.resendOTP);

/*
    @route POST /auth/forgot-password
    @desc Send password reset code to email
    @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/*
    @route POST /auth/reset-password
    @desc Reset password with OTP
    @access Public
 */
router.post('/reset-password', authController.resetPassword);

/*
    @route GET /auth/me
    @desc Get current authenticated user details
    @access Private
*/
router.get('/me', validateUser, authController.me);

/*
    @route POST /auth/logout
    @desc Logout current user and invalidate token
    @access Private
*/
router.post('/logout', validateUser, authController.logout);

export default router;