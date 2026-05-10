import { init, expressMiddleware } from 'instalert';
import express from 'express';


const INSTALERT_API = 'ik_live_ZevcICjvuDunchH5cfFQBPgw7t0eq6Qy`';
const app = express();

// Initialize InstaAlert - this also sets up uncaught exception handlers
init({
  apiKey: INSTALERT_API,
  serverName: 'my-server',
  metadata: { environment: 'production' }
});

// Your routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/error', (req, res) => {
  throw new Error('Server error occurred! Overloaded');
});

// Error tracking middleware MUST be after all routes (Express convention)
app.use(expressMiddleware());

app.listen(4000);
