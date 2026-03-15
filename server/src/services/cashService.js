const db =require('../db') 

const createReport = async (reportData) => {
    // 1. פירוק הנתונים (שימי לב שאנחנו צריכים branch_id ולא שם)
    // אם מה-React מגיע כרגע שם הסניף, נצטרך להמיר אותו ל-ID או לשלוח ID מה-React
    const { branchId, bills } = reportData;

    // 2. השאילתה המעודכנת לפי שמות השדות שלך
    // הסרנו את total_amount כי היא עמודה מחושבת אוטומטית ב-DB
    const query = `
        INSERT INTO daily_cash_reports 
        (branch_id, report_date, bills_20, bills_50, bills_100, bills_200) 
        VALUES (?, CURDATE(), ?, ?, ?, ?)
    `;

    // 3. סידור הערכים במערך
    const values = [
        branchId || 1,        // מזהה הסניף (וודאי שקיים ID כזה בטבלת הסניפים)
        bills[20] || 0,
        bills[50] || 0,
        bills[100] || 0,
        bills[200] || 0
    ];

    try {
        const [result] = await db.execute(query, values);
        return result;
    } catch (error) {
        console.error("Database Query Error:", error.message);
        throw error;
    }
};

module.exports = { createReport };