import {io,server} from './src/socket/socket.js';
import connectDB from "./src/config/db.js";
import cronScoreService from "./src/services/cronScore.service.js";


const PORT = process.env.PORT || 3001;

connectDB()


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  cronScoreService.checkAndResetMonthlyScores();
});
