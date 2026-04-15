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

    // פונקציית עדכון (PUT) 

updateReport: async (recordId, data) => {
    try {
        console.log("🔧 updateReport - Start", { recordId });
        
        const { bills } = data; // הוצאנו את total_amount, אנחנו לא צריכים אותו כאן
        
        if (!bills) {
            throw new Error("Bills data is missing from request");
        }
        
        // המרת ערכי השטרות למספרים
        const bills20 = Number(bills['20'] || bills[20] || 0);
        const bills50 = Number(bills['50'] || bills[50] || 0);
        const bills100 = Number(bills['100'] || bills[100] || 0);
        const bills200 = Number(bills['200'] || bills[200] || 0);
        const recId = Number(recordId);
        
        // מערך הערכים כעת מכיל רק את השטרות וה-ID
        const values = [bills20, bills50, bills100, bills200, recId];
        
        const query = `
            UPDATE daily_cash_reports 
            SET bills_20 = ?, bills_50 = ?, bills_100 = ?, bills_200 = ?
            WHERE id = ?
        `;
        
        console.log("🚀 Executing UPDATE (without total_amount)...");
        const [result] = await db.execute(query, values);
        
        return { id: recordId, ...data };
    } catch (err) {
        console.error("❌ ERROR in updateReport:", err.message);
        throw err;
    }
}
};

module.exports = cashService;