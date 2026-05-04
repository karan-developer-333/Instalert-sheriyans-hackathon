import { configure } from './lib/sender.js';
import { captureError, expressMiddleware } from './lib/capture.js';

export const init = (userConfig) => {
  if (!userConfig.apiKey) {
    console.error('[InstaAlert] apiKey is required in init() config.');
    return;
  }

  if (!userConfig.serverName) {
    console.error('[InstaAlert] serverName is required in init() config.');
    return;
  }

  configure({
    apiKey: userConfig.apiKey,
    serverName: userConfig.serverName,
    backendUrl: userConfig.backendUrl || 'https://instalert-api.vercel.app',
    metadata: userConfig.metadata || {},
  });
};

export { expressMiddleware, captureError };
