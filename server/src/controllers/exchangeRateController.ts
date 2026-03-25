import * as express from 'express';
// ייבוא הסרוויס - וודאי שהנתיב תקין לפי מבנה התיקיות שלך
import exchangeRateService from '../services/exchangeRateService';

export const exchangeRateController = {
  /**
   * מטפל בבקשת GET לקבלת שערי החליפין
   * שימוש ב-any בפרמטרים עוקף שגיאות הגדרה של Express ב-TS
   */
  getLatestRates: async (req: any, res: any) => {
    try {
      // קריאה לשכבת הסרוויס 
      // ה-as any הכרחי כאן כדי ש-TS יאפשר לבדוק .length על התוצאה מה-DB
      const rates = await exchangeRateService.getAllRates() as any;

      // בדיקה: האם חזרו נתונים והאם זה מערך
      if (!rates || (Array.isArray(rates) && rates.length === 0)) {
        return res.status(200).json([]);
      }

      // החזרת הנתונים לקליינט בפורמט JSON
      return res.status(200).json(rates);
    } catch (error: any) {
      // הדפסת השגיאה לטרמינל של השרת לצורך דיבאגינג
      console.error('Error in getLatestRates controller:', error);
      
      // החזרת תשובת שגיאה מסודרת לקליינט
      return res.status(500).json({ 
        message: 'שגיאה בשרת בעת שליפת שערי חליפין',
        error: error.message 
      });
    }
  }
};