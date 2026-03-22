const db =require('../db') 
const bcrypt = require('bcryptjs'); // ייבוא הספרייה

class AuthService {
    static async validateUser(username, password) {
    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.query(query, [username]);
        
        if (rows.length === 0) return null;

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            // הוספנו כאן את user.role
            return { id: user.id, username: user.username, role: user.role };
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