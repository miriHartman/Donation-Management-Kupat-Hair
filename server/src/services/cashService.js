const db = require('../db');

const cashService = {
    // שליפת סיכום להיום לפי ID סניף
    getDailyReport: async (branchId) => {
        const query = `
            SELECT id, branch_id, report_date, bills_20, bills_50, bills_100, bills_200, total_amount 
            FROM daily_cash_reports 
            WHERE branch_id = ? AND report_date = CURDATE()
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [branchId]);
        return rows[0] || null;
    },

    // יצירת סיכום חדש
    createReport: async (data) => {
        const { branchId, bills, total_amount } = data;
        const query = `
            INSERT INTO daily_cash_reports 
            (branch_id, report_date, bills_20, bills_50, bills_100, bills_200, total_amount) 
            VALUES (?, CURDATE(), ?, ?, ?, ?, ?)
        `;
        const values = [
            branchId,
            bills[20] || 0,
            bills[50] || 0,
            bills[100] || 0,
            bills[200] || 0,
            total_amount || 0
        ];
        const [result] = await db.execute(query, values);
        return { id: result.insertId, ...data };
    },

    // פונקציית עדכון (PUT) שביקשת
    updateReport: async (recordId, data) => {
        const { bills, total_amount } = data;
        const query = `
            UPDATE daily_cash_reports 
            SET bills_20 = ?, bills_50 = ?, bills_100 = ?, bills_200 = ?, total_amount = ?
            WHERE id = ?
        `;
        const values = [
            bills[20] || 0,
            bills[50] || 0,
            bills[100] || 0,
            bills[200] || 0,
            total_amount || 0,
            recordId
        ];
        await db.execute(query, values);
        return { id: recordId, ...data };
    }
};

module.exports = cashService;