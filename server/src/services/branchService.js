const db = require('../db');

class BranchService {
    // // 1. שליפת סניפים פעילים בלבד
    // static async getActiveBranches() {
    //     try {
    //         const query = `
    //             SELECT 
    //                 id, 
    //                 name, 
    //                 address,
    //                 phone,
    //                 is_active
    //             FROM branches 
    //             WHERE is_active = 1
    //             ORDER BY name ASC
    //         `;
    //         const [rows] = await db.query(query);
    //         return rows;
    //     } catch (error) {
    //         console.error('Error in BranchService.getActiveBranches:', error);
    //         throw error;
    //     }
    // }

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
        // 1. בדיקה האם קיימות תרומות המשויכות לסניף זה
        // נשתמש בשאילתה שסופרת כמה תרומות יש לסניף
        const checkQuery = `SELECT COUNT(*) as donationCount FROM donations WHERE branch_id = ?`;
        const [rows] = await db.query(checkQuery, [id]);
        
        const hasDonations = rows[0].donationCount > 0;

        if (hasDonations) {
            // 2. אם יש תרומות - בצע מחיקה רכה (השבתה)
            const updateQuery = `
                UPDATE branches 
                SET is_active = 0 
                WHERE id = ?
            `;
            const [updateResult] = await db.query(updateQuery, [id]);
            
            // אנחנו מחזירים אובייקט עם מידע על הפעולה שבוצעה
            return { 
                success: true, 
                action: 'deactivated', 
                affectedRows: updateResult.affectedRows 
            };
        } else {
            // 3. אם אין תרומות - מחק את השורה מהטבלה לצמיתות
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
    }}}
module.exports = BranchService;