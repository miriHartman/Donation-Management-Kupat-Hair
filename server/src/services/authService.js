const db =require('../db') 
const bcrypt = require('bcryptjs'); // ייבוא הספרייה

class AuthService {
    static async validateUser(username, password) {
    try {
        // ← הוסף JOIN לשליפת שם הסניף
        const query = `
            SELECT u.*, b.name as branch_name 
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.username = ?
        `;
        const [rows] = await db.query(query, [username]);
        
        if (rows.length === 0) return null;

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            return { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                branchId: user.branch_id,      // ← הוסף
                branchName: user.branch_name    // ← הוסף
            };
        }
        return null;
    } catch (error) {
        console.error('Bcrypt error:', error);
        throw error;
    }
}

static async getAllUsers() {
    try {
        const query = 'SELECT username FROM users';
        const [rows] = await db.query(query);
        return rows.map(user => user.username); 
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }

}
}

module.exports = AuthService;