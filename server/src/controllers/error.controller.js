import Incident from '../models/incident.model.js';
import errorAi from '../services/errorAi.service.js';
import * as emailService from '../services/email-client.js';
import Organization from '../models/organization.model.js';
import { io } from '../socket/socket.js';

const reportError = async (req, res) => {
  try {
    const { errorMessage, stackTrace, statusCode, endpoint, method, metadata, serverName } = req.body;
    const { organization } = req;

    if (!errorMessage) {
      return res.status(400).json({ message: 'errorMessage is required' });
    }

    const newError = { errorMessage, stackTrace, statusCode, endpoint, method, metadata, serverName };

    const similarIncident = await errorAi.checkSimilarity(newError, organization._id);

    if (similarIncident) {
      const solutionPrompt = await errorAi.generateFixSuggestion(newError, similarIncident);
      await emailService.sendErrorNotification(
        organization.owner.email,
        serverName || 'unknown-server',
        { 
          errorMessage, 
          stackTrace: similarIncident.description, 
          endpoint, 
          statusCode,
          severity: similarIncident.severity
        },
        true,
        solutionPrompt
      );
      return res.status(202).json({ message: 'Duplicate error detected, notification sent' });
    }

    const fingerprint = errorAi.generateFingerprint(errorMessage, stackTrace, endpoint);
    const rawIncident = await Incident.create({
      title: errorMessage.substring(0, 100),
      description: `Auto-detected error on ${serverName || 'unknown-server'}\n\n${stackTrace || ''}`,
      organization: organization._id,
      source: 'auto-error',
      errorFingerprint: fingerprint,
      serverName,
      status: 'in_progress'
    });

    const enhanced = await errorAi.enhanceIncident({ errorMessage, stackTrace, statusCode, endpoint, method, metadata, serverName }, organization);

    const updatedIncident = await Incident.findByIdAndUpdate(rawIncident._id, {
      title: enhanced.title,
      description: enhanced.description,
      severity: enhanced.severity,
      status: 'open'
    }, { new: true });

    const solutionPrompt = await errorAi.generateSolutionPrompt({ ...newError, enhancedTitle: enhanced.title });

    await emailService.sendErrorNotification(
      organization.owner.email,
      serverName || 'unknown-server',
      { 
        errorMessage: enhanced.title, 
        stackTrace: enhanced.description, 
        endpoint, 
        statusCode,
        severity: enhanced.severity
      },
      false,
      solutionPrompt
    );

    if (io) {
      io.to(`org:${organization.organizationJoinCode}`).emit('receive-incident', updatedIncident);
      console.log(`[Socket] Error incident broadcasted to org:${organization.organizationJoinCode}`);
    }

    res.status(202).json({ message: 'New incident created', incidentId: rawIncident._id });
  } catch (error) {
    console.error('Error report failed:', error);
    res.status(500).json({ message: 'Failed to process error report' });
  }
};

export default { reportError };
