import { sendError } from './sender.js';

export const captureError = (err, req) => {
  const errorData = {
    message: err.message || 'Unknown error',
    stack: err.stack || '',
    statusCode: err.statusCode || err.status || 500,
    endpoint: req?.originalUrl || req?.url || '',
    method: req?.method || '',
    metadata: {
      headers: req?.headers ? JSON.stringify(req.headers) : '{}',
      body: req?.body ? JSON.stringify(req.body) : '{}',
    },
  };

  return sendError(errorData);
};

export const expressMiddleware = () => {
  return (err, req, res, next) => {
    captureError(err, req).catch(() => {
    });

    next(err);
  };
};
