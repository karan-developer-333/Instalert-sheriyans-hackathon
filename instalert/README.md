# InstaAlert SDK

InstaAlert SDK for automatic error reporting with AI-powered debugging suggestions.

## Installation

```bash
npm install @instalert/sdk
```

## Quick Start

```javascript
import express from 'express';
import { init, expressMiddleware } from '@instalert/sdk';

const app = express();
app.use(express.json());

// Initialize InstaAlert
init({
  apiKey: 'ik_live_YOUR_API_KEY_HERE',  // Get this from your InstaAlert dashboard
  serverName: 'my-backend-server',
  backendUrl: 'https://instalert-api.vercel.app', // Optional: defaults to this
  metadata: {
    environment: 'production',
    version: '1.0.0'
  }
});

// Your routes
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/crash', (req, res) => {
  const user = undefined;
  res.json({ name: user.name }); // This will throw a TypeError
});

// Use the error capture middleware (should be last middleware)
app.use(expressMiddleware());

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
```

## Quick Start

```javascript
import express from 'express';
import { init, expressMiddleware } from 'instalert';

const app = express();
app.use(express.json());

// Initialize InstaAlert
init({
  apiKey: 'ik_live_YOUR_API_KEY_HERE',  // Get this from your InstaAlert dashboard
  serverName: 'my-backend-server',
  backendUrl: 'https://instalert-api.vercel.app', // Optional: defaults to this
  metadata: {
    environment: 'production',
    version: '1.0.0'
  }
});

// Your routes
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/crash', (req, res) => {
  const user = undefined;
  res.json({ name: user.name }); // This will throw a TypeError
});

// Use the error capture middleware (should be last middleware)
app.use(expressMiddleware());

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
```

## API

### `init(config)`

Initialize the SDK with your configuration.

**Config Options:**
- `apiKey` (required): Your API key from InstaAlert dashboard
- `serverName` (required): Name to identify this server
- `backendUrl` (optional): InstaAlert backend URL (defaults to `https://instalert-api.vercel.app`)
- `metadata` (optional): Additional metadata to attach to all error reports

### `expressMiddleware()`

Returns an Express error middleware that automatically captures all unhandled errors.

```javascript
app.use(expressMiddleware());
```

### `captureError(err, req)`

Manually capture an error with request context.

```javascript
try {
  // some operation
} catch (err) {
  captureError(err, req);
}
```

## Getting Your API Key

1. Login to your InstaAlert dashboard
2. Navigate to `/dashboard/api-keys`
3. Generate a new API key
4. Copy and use it in your `init()` call

## Error Routes Example

After setup, hit error routes to test:

```bash
curl http://localhost:4000/api/crash
```

This will:
1. Catch the error via `expressMiddleware`
2. Send error details to InstaAlert
3. AI analyzes the error
4. You get an email with fix suggestions

## License

MIT
