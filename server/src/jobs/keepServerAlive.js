const cron = require('node-cron');
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL+"api/health" || 'http://localhost:3000';

// כל 14 דקות, ראשון עד שישי (0-5), מדלג על שבת (6)
cron.schedule('*/14 * * * 0-5', async () => {
    try {
        await axios.get(SERVER_URL);
        console.log(`[${new Date().toLocaleString('he-IL')}] Keep-alive ping sent ✅`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString('he-IL')}] Keep-alive failed ❌:`, error.message);
    }
});

console.log('Keep-alive cron job started');

module.exports = {};