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
            console.log("📝 createReport - Start");
            const { branchId, bills } = data;
            
            if (!branchId || !bills) {
                throw new Error("Missing branchId or bills data");
            }
            
            // שים לב: הוצאנו את total_amount מהערכים כי ה-DB מחשב אותו
            const values = [
                Number(branchId),
                Number(bills[20]) || 0,
                Number(bills[50]) || 0,
                Number(bills[100]) || 0,
                Number(bills[200]) || 0
            ];
            
            const query = `
                INSERT INTO daily_cash_reports 
                (branch_id, report_date, bills_20, bills_50, bills_100, bills_200) 
                VALUES (?, CURDATE(), ?, ?, ?, ?)
            `;
            
            console.log("🚀 Executing INSERT (Generated Column Safety)...");
            const [result] = await db.execute(query, values);
            console.log("✅ Insert successful, insertId:", result.insertId);
            
            return { id: result.insertId, ...data };
        } catch (err) {
            console.error("❌ ERROR in createReport:", err.message);
            throw err;
        }
    },

    // פונקציית עדכון (PUT)
    updateReport: async (recordId, data) => {
        try {
            console.log("🔧 updateReport - Start", { recordId });
            const { bills } = data;
            
            if (!bills || !recordId) {
                throw new Error("Missing bills or recordId");
            }
            
            const values = [
                Number(bills['20'] || bills[20] || 0),
                Number(bills['50'] || bills[50] || 0),
                Number(bills['100'] || bills[100] || 0),
                Number(bills['200'] || bills[200] || 0),
                Number(recordId)
            ];
            
            const query = `
                UPDATE daily_cash_reports 
                SET bills_20 = ?, bills_50 = ?, bills_100 = ?, bills_200 = ?
                WHERE id = ?
            `;
            
            console.log("🚀 Executing UPDATE (Generated Column Safety)...");
            const [result] = await db.execute(query, values);
            console.log("✅ Update successful, affectedRows:", result.affectedRows);
            
            return { id: recordId, ...data };
        } catch (err) {
            console.error("❌ ERROR in updateReport:", err.message);
            throw err;
        }
    }
};

module.exports = cashService;