// ב-JS רגיל משתמשים ב-require ולא ב-import

const exchangeRateService = require("../services/exchangeRateService");

const exchangeRateController = {
  /**
   * מטפל בבקשת GET לקבלת שערי החליפין
   */
  getLatestRates: async (req, res) => {
    try {
      // קריאה לשכבת הסרוויס
      const rates = await exchangeRateService.getAllRates();

      // בדיקה: האם חזרו נתונים והאם זה מערך
      if (!rates || (Array.isArray(rates) && rates.length === 0)) {
        return res.status(200).json([]);
      }

      // החזרת הנתונים לקליינט בפורמט JSON
      return res.status(200).json(rates);
    } catch (error) {
      // הדפסת השגיאה לטרמינל לצורך דיבאגינג
      console.error('Error in getLatestRates controller:', error);
      
      // החזרת תשובת שגיאה מסודרת
      return res.status(500).json({ 
        message: 'שגיאה בשרת בעת שליפת שערי חליפין',
        error: error.message 
      });
    }
  }
};

module.exports =  exchangeRateController ;