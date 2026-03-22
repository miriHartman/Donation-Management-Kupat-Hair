const jwt = require('jsonwebtoken');
const AuthService = require('../services/authService'); // וודאי שזו הפעם היחידה שהשורה הזו מופיעה!

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await AuthService.validateUser(username, password);
        if (user) {
            // יצירת הטוקן
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET, 
                { expiresIn: '12h' }
            );



res.status(200).json({ 
    message: 'התחברת בהצלחה',
    token, 
    user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
    }
});

        } else {
            res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'שגיאת שרת פנימית' });
    }
};
// שליפת כל שמות המשתמשים
const getAllUsers = async (req, res) => {
    try {
        const users = await AuthService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Controller Error (getAllUsers):', error);
        res.status(500).json({
            message: 'שגיאה בשליפת רשימת המשתמשים',
            error: error.message
        });
    }
};


module.exports = { login, getAllUsers };