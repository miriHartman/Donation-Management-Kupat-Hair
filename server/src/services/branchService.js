const db =require('../db') 

class BranchService {
    static async getAllBranches() {
        try {
            // שליפת כל הסניפים. אם השמות ב-DB הם ב-Snake Case, נמיר אותם ל-Camel Case עבור הפרונטנד
            const query = `
                SELECT 
                    id, 
                    name, 
                    address,
                    phone,
                    employee_count as employees
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
}

module.exports = BranchService;