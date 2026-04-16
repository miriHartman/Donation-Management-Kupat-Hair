const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');

const BOI_URL = 'https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS,RER_EUR_ILS?lastNObservations=1&format=sdmx-json';

async function updateExchangeRates() {
    try {
        console.log('Fetching rates from Bank of Israel...');

        const response = await axios.get(BOI_URL);

        const series = response.data.data.dataSets[0].series;
        const seriesValues = response.data.data.structure.dimensions.series[0].values;
        // seriesValues[0] = { id: "RER_EUR_ILS" }
        // seriesValues[1] = { id: "RER_USD_ILS" }

        const updates = Object.keys(series).map(async (key) => {
            const seriesIndex = parseInt(key.split(':')[0]); // המספר הראשון = אינדקס המטבע
            const seriesCodeRaw = seriesValues[seriesIndex].id; // RER_EUR_ILS או RER_USD_ILS
            const currencyCode = seriesCodeRaw.split('_')[1]; // EUR או USD

            const rate = series[key].observations['0'][0]; // ✅ string key '0'

            if (currencyCode && rate) {
                const sql = `
                    INSERT INTO exchange_rates (currency_code, rate) 
                    VALUES (?, ?) 
                    ON DUPLICATE KEY UPDATE rate = VALUES(rate), last_update = CURRENT_TIMESTAMP
                `;
                await db.execute(sql, [currencyCode, parseFloat(rate)]);
                console.log(`Updated ${currencyCode}: ${rate}`);
            }
        });

        await Promise.all(updates);
        console.log('Done updating exchange rates.');

    } catch (error) {
        console.error('Error updating rates from BOI:', error.message);
    }
}

cron.schedule('30 9 * * 1-5', () => {
    updateExchangeRates();
});

module.exports = { updateExchangeRates };