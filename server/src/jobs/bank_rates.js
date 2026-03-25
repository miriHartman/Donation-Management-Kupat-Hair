const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');

async function updateExchangeRates() {
    try {
        console.log('Fetching rates from Bank of Israel...');
        
        // כתובת ה-API לפי הדוקומנטציה ששלחת (שליפת הדולר והאירו האחרונים בפורמט JSON)

        const response = await axios.get(process.env.BANK_RATES_API_KEY);
        
        // חילוץ הנתונים מהמבנה המורכב של SDMX-JSON
        const observations = response.data.dataSets[0].series;
        const structures = response.data.structure.dimensions.series;
        
        // מיפוי הקודים (USD/EUR) לערכים שלהם
        // ב-SDMX המידע מפוצל בין ה-Structure לבין ה-DataSet
        Object.keys(observations).forEach(async (key) => {
            const seriesIndex = key.split(':');
            const currencyCodeRaw = structures[1].values[seriesIndex[1]].id; // מחזיר RER_USD_ILS
            const currencyCode = currencyCodeRaw.split('_')[1]; // מחלץ רק USD או EUR
            
            const obsData = observations[key].observations['0'];
            const rate = obsData[0]; // השער היציג

            if (currencyCode && rate) {
                const sql = `
                    INSERT INTO exchange_rates (currency_code, rate) 
                    VALUES (?, ?) 
                    ON DUPLICATE KEY UPDATE rate = VALUES(rate), last_update = CURRENT_TIMESTAMP
                `;
                await db.execute(sql, [currencyCode, rate]);
                console.log(`Updated ${currencyCode}: ${rate}`);
            }
        });

    } catch (error) {
        console.error('Error updating rates from BOI:', error);
    }
}

// התזמון שלך (16:30 בימי חול)
cron.schedule('30 16 * * 1-5', () => {
    updateExchangeRates();
});

// הרצה ראשונית
updateExchangeRates();

module.exports = { updateExchangeRates };