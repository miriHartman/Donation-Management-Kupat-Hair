const cron = require('node-cron');
const axios = require('axios');
const db = require('./db'); // החיבור שלך ל-MySQL

async function updateExchangeRates() {
    try {
        // פנייה ל-API של בנק ישראל (או ספק שערים אחר בפורמט JSON)
        const response = await axios.get(process.env.BANK_RATES_API_KEY);
        const rates = response.data; // נניח שזה מערך של מטבעות

        for (let rate of rates) {
            const sql = `
                INSERT INTO exchange_rates (currency_code, rate) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE rate = VALUES(rate), last_update = CURRENT_TIMESTAMP
            `;
            await db.execute(sql, [rate.key, rate.currentExchangeRate]);
        }
        console.log('Exchange rates updated successfully');
    } catch (error) {
        console.error('Error updating rates:', error);
    }
}

// הגדרת ה-Job: ירוץ כל יום בשעה 16:30 (שני עד שישי)
// פורמט: דקה (30) שעה (16) יום בחודש (*) חודש (*) יום בשבוע (1-5)
cron.schedule('30 16 * * 1-5', () => {
    console.log('Running daily exchange rate update...');
    updateExchangeRates();
});


// הפעלה מתוזמנת
cron.schedule('30 16 * * 1-5', () => {
    console.log('Running daily exchange rate update...');
    updateExchangeRates();
});

// הרצה ידנית פעם אחת בעליית השרת כדי שיהיו נתונים מעודכנים מיד
updateExchangeRates();