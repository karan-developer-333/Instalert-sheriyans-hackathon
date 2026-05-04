import express from 'express';
import errorController from '../controllers/error.controller.js';
import apiKeyAuth from '../middlewares/apiKeyAuth.middleware.js';

const router = express.Router();

router.post('/report', apiKeyAuth, errorController.reportError);

export default router;
