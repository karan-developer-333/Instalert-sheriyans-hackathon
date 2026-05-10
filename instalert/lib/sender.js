import axios from 'axios';

let config = {
  apiKey: null,
  serverName: 'unknown-server',
  backendUrl: 'https://instalert-api.onrender.com',
  metadata: {},
};

export const configure = (userConfig) => {
  config = { ...config, ...userConfig };
};

export const sendError = async (errorData) => {
  if (!config.apiKey) {
    console.error('[InstaAlert] API key not configured. Call init() first.');
    return;
  }

  try {
    const payload = {
      errorMessage: errorData.message || 'Unknown error',
      stackTrace: errorData.stack || '',
      statusCode: errorData.statusCode || 500,
      endpoint: errorData.endpoint || '',
      method: errorData.method || '',
      metadata: { ...config.metadata, ...errorData.metadata },
      serverName: config.serverName,
    };

    const response = await axios.post(
      `${config.backendUrl}/api/error/report`,
      payload,
      {
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('[InstaAlert] Invalid API key. Please check your API key in the dashboard.');
    } else {
      console.error('[InstaAlert] Failed to send error report:', error.message);
    }
    throw error;
  }
};
