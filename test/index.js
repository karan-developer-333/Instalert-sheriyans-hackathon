import { init, expressMiddleware } from '../instalert/index.js';
import express from 'express';


const INSTALERT_API = 'ik_live_WyainnDKIgYhXRWvjFauWw44wBMJzHnk';
const app = express();

// Initialize InstaAlert - this also sets up uncaught exception handlers
init({
  apiKey: INSTALERT_API,
  serverName: 'my-server',
  // backendUrl: 'http://localhost:3001',
  metadata: { environment: 'production' }
});

// Your routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/error', (req, res) => {
  throw new Error('DDOS ATTACK! Server is downed!');
});

// Error tracking middleware MUST be after all routes (Express convention)
app.use(expressMiddleware());

app.listen(4000);
