
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // מקבל "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: 'לא סופק טוקן אימות' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // שומר את פרטי המשתמש בתוך ה-request להמשך
        next();
    } catch (err) {
        return res.status(401).json({ message: 'טוקן לא בתוקף' });
    }
};

module.exports = verifyToken;