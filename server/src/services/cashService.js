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
        try {
            console.log("📝 createReport called with:", { dataKeys: Object.keys(data) });
            const { branchId, bills, total_amount } = data;
            
            if (!branchId || !bills) {
                throw new Error("Missing required fields: branchId or bills");
            }
            
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
            
            console.log("🗄️ Insert values:", values);
            
            const [result] = await db.execute(query, values);
            console.log("✅ Insert successful, ID:", result.insertId);
            return { id: result.insertId, ...data };
        } catch (err) {
            console.error("❌ Error in createReport:", err.message);
            throw err;
        }
    },

    // פונקציית עדכון (PUT) שביקשת
    updateReport: async (recordId, data) => {
        try {
            console.log("🔧 updateReport called with:", { recordId, dataKeys: Object.keys(data) });
            const { bills, total_amount } = data;
            
            if (!bills || Object.keys(bills).length === 0) {
                throw new Error("Bills data is missing or empty");
            }
            
            console.log("📊 Bills to update:", bills);
            
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
            
            console.log("🗄️ Query values:", values);
            
            const [result] = await db.execute(query, values);
            console.log("✅ Update successful");
            return { id: recordId, ...data };
        } catch (err) {
            console.error("❌ Error in updateReport:", err.message);
            throw err;
        }
    }
};

module.exports = cashService;