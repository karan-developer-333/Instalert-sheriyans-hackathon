import { config } from 'dotenv';
config({ path: './.env' });

import { initSocket } from './src/socket/socket.js';
import connectDB from "./src/config/db.js";
import aiScoreService from "./src/services/aiScore.service.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();

  const { server } = initSocket(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    aiScoreService.resetMonthlyScores();
  });
};

start();
