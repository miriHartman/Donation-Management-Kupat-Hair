const db = require('../db');

const exchangeRateService = {
    /**
     * שליפת כל שערי החליפין המעודכנים מהמסד
     * משמש את המחשבון בצד הלקוח
     */
    getAllRates: async () => {
        try {
            // שאילתה פשוטה לשליפת קוד המטבע והשער שלו
            const query = `
                SELECT currency_code, rate 
                FROM exchange_rates 
                ORDER BY currency_code ASC
            `;
            
            const [rows] = await db.execute(query);
            
            // מחזיר את כל השורות שנמצאו
            return rows;
        } catch (error) {
            console.error('Error fetching exchange rates from DB:', error);
            throw error; // זריקת השגיאה הלאה לקונטרולר שיטפל בה
        }
    },

    
    updateRate: async (currencyCode, newRate) => {
        const query = `
            UPDATE exchange_rates 
            SET rate = ?, updated_at = NOW() 
            WHERE currency_code = ?
        `;
        const [result] = await db.execute(query, [newRate, currencyCode]);
        return result.affectedRows > 0;
    }
};

module.exports = exchangeRateService;