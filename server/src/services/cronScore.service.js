import aiScoreService from "./aiScore.service.js";

const checkAndResetMonthlyScores = async () => {
    try {
        const now = new Date();
        const dayOfMonth = now.getDate();

        if (dayOfMonth === 1) {
            console.log("Monthly score reset triggered for", now.toISOString());
            await aiScoreService.resetMonthlyScores();
        }
    } catch (error) {
        console.error("checkAndResetMonthlyScores error:", error);
    }
};

export default {
    checkAndResetMonthlyScores,
};
