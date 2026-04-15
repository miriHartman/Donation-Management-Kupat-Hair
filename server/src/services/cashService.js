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
            console.log("   Input data keys:", Object.keys(data));
            
            const { branchId, bills, total_amount } = data;
            
            console.log("   branchId:", branchId);
            console.log("   bills:", bills);
            console.log("   total_amount:", total_amount);
            
            if (!branchId) {
                throw new Error("branchId is missing from request");
            }
            
            if (!bills) {
                throw new Error("Bills data is missing from request");
            }
            
            const values = [
                Number(branchId),
                Number(bills[20]) || 0,
                Number(bills[50]) || 0,
                Number(bills[100]) || 0,
                Number(bills[200]) || 0,
                Number(total_amount) || 0
            ];
            
            console.log("   Query values (converted to numbers):", values);
            
            const query = `
                INSERT INTO daily_cash_reports 
                (branch_id, report_date, bills_20, bills_50, bills_100, bills_200, total_amount) 
                VALUES (?, CURDATE(), ?, ?, ?, ?, ?)
            `;
            
            console.log("   Executing INSERT query...");
            const [result] = await db.execute(query, values);
            console.log("   ✅ Insert successful, insertId:", result.insertId);
            
            return { id: result.insertId, ...data };
        } catch (err) {
            console.error("   ❌ ERROR in createReport:", err.message);
            throw err;
        }
    },

    // פונקציית עדכון (PUT) שביקשת
    updateReport: async (recordId, data) => {
        try {
            console.log("🔧 updateReport - Start", { recordId });
            console.log("   Input data keys:", Object.keys(data));
            
            const { bills, total_amount } = data;
            
            console.log("   bills:", bills);
            console.log("   total_amount:", total_amount);
            
            if (!bills) {
                throw new Error("Bills data is missing from request");
            }
            
            if (!recordId) {
                throw new Error("RecordId is missing");
            }
            
            const values = [
                Number(bills[20]) || 0,
                Number(bills[50]) || 0,
                Number(bills[100]) || 0,
                Number(bills[200]) || 0,
                Number(total_amount) || 0,
                Number(recordId)
            ];
            
            console.log("   Query values (converted to numbers):", values);
            
            const query = `
                UPDATE daily_cash_reports 
                SET bills_20 = ?, bills_50 = ?, bills_100 = ?, bills_200 = ?, total_amount = ?
                WHERE id = ?
            `;
            
            console.log("   Executing UPDATE query...");
            const [result] = await db.execute(query, values);
            console.log("   ✅ Update successful, affectedRows:", result.affectedRows);
            
            if (result.affectedRows === 0) {
                console.warn("   ⚠️ WARNING: No rows were updated. Record might not exist.");
            }
            
            return { id: recordId, ...data };
        } catch (err) {
            console.error("   ❌ ERROR in updateReport:", err.message);
            throw err;
        }
    }
};

module.exports = cashService;