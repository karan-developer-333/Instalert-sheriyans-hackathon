import Organization from '../models/organization.model.js';

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'Missing API key' });
  }

  try {
    const organization = await Organization.findOne({ apiKey }).select('+apiKey').populate('owner');
    if (!organization) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    organization.apiKeyGeneratedAt = new Date();
    await organization.save();

    req.organization = organization;
    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export default apiKeyAuth;
