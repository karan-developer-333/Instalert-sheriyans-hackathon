import express from 'express';
import Organization from '../models/organization.model.js';
import validateUser from '../middlewares/validateUser.middleware.js';
import validateAccessMiddleware from '../middlewares/validateAccess.middleware.js';

const router = express.Router();

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ik_live_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

router.post('/generate', validateUser, validateAccessMiddleware.validateOrganization, async (req, res) => {
  try {
    const org = await Organization.findOne({ owner: req.user.id });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const plainKey = generateApiKey();
    org.apiKey = plainKey;
    org.apiKeyGeneratedAt = new Date();
    await org.save();

    res.status(201).json({ apiKey: plainKey, message: 'Save this key securely. It will not be shown again.' });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ message: 'Failed to generate API key' });
  }
});

router.get('/list', validateUser, validateAccessMiddleware.validateOrganization, async (req, res) => {
  try {
    const org = await Organization.findOne({ owner: req.user.id }).select('+apiKey apiKeyGeneratedAt');
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (!org.apiKey) {
      return res.json(null);
    }

    res.json({
      preview: `ik_live_${'*'.repeat(28)}${org.apiKey.slice(-4)}`,
      generatedAt: org.apiKeyGeneratedAt
    });
  } catch (error) {
    console.error('List API key error:', error);
    res.status(500).json({ message: 'Failed to list API key' });
  }
});

router.delete('/revoke', validateUser, validateAccessMiddleware.validateOrganization, async (req, res) => {
  try {
    const org = await Organization.findOne({ owner: req.user.id }).select('+apiKey');
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    org.apiKey = null;
    org.apiKeyGeneratedAt = null;
    await org.save();

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ message: 'Failed to revoke API key' });
  }
});

export default router;
