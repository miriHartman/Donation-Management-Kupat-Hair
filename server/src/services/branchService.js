const db = require('../db');

class BranchService {

    // 2. שליפת כל הסניפים (כולל מושבתים)
    static async getAllBranches() {
        try {
            const query = `
                SELECT 
                    id, 
                    name, 
                    address,
                    phone,
                    is_active
                FROM branches 
                ORDER BY name ASC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Error in BranchService.getAllBranches:', error);
            throw error;
        }
    }

    // 3. יצירת סניף חדש
    static async createBranch(branchData) {
        try {
            const { name, address, phone, is_active } = branchData;
            const query = `
                INSERT INTO branches (name, address, phone, is_active)
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.query(query, [name, address, phone, is_active ?? 1]);
            
            // מחזירים את האובייקט שנוצר כולל ה-ID החדש
            return { id: result.insertId, ...branchData };
        } catch (error) {
            console.error('Error in BranchService.createBranch:', error);
            throw error;
        }
    }

    // 4. עדכון סניף קיים
    static async updateBranch(id, branchData) {
        try {
            const { name, address, phone, is_active } = branchData;
            const query = `
                UPDATE branches 
                SET name = ?, address = ?, phone = ?, is_active = ?
                WHERE id = ?
            `;
            await db.query(query, [name, address, phone, is_active, id]);
            return { id, ...branchData };
        } catch (error) {
            console.error('Error in BranchService.updateBranch:', error);
            throw error;
        }
    }
// 5. מחיקת סניף - מחיקה סופית או השבתה בהתאם לקיום תרומות
static async deleteBranch(id) {
    try {
        // 1. בדיקה בשתי הטבלאות במקביל
        const checkDonationsQuery = `SELECT COUNT(*) as count FROM donations WHERE branch_id = ?`;
        const checkReportsQuery = `SELECT COUNT(*) as count FROM daily_cash_reports WHERE branch_id = ?`;

        const [[donationsRes], [reportsRes]] = await Promise.all([
            db.query(checkDonationsQuery, [id]),
            db.query(checkReportsQuery, [id])
        ]);

        const hasHistory = donationsRes[0].count > 0 || reportsRes[0].count > 0;

        if (hasHistory) {
            // 2. אם יש היסטוריה (תרומות או דוחות) - השבתה בלבד
            const updateQuery = `UPDATE branches SET is_active = 0 WHERE id = ?`;
            const [updateResult] = await db.query(updateQuery, [id]);
            
            return { 
                success: true, 
                action: 'deactivated', 
                affectedRows: updateResult.affectedRows 
            };
        } else {
            // 3. אם הסניף נקי לגמרי - מחיקה לצמיתות
            const deleteQuery = `DELETE FROM branches WHERE id = ?`;
            const [deleteResult] = await db.query(deleteQuery, [id]);
            
            return { 
                success: true, 
                action: 'deleted', 
                affectedRows: deleteResult.affectedRows 
            };
        }
    } catch (error) {
        console.error('Error in BranchService.deleteBranch:', error);
        throw error;
    }
}}
module.exports = BranchService;