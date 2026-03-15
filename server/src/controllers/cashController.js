const cashService = require('../services/cashService');

const saveCashReport = async (req, res) => {
    try {
        console.log("נתונים שהתקבלו מה-React:", req.body);
        const result = await cashService.createReport(req.body);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        // הדפסה לטרמינל של השרת
        console.error("שגיאת שרת פנימית:");
        console.error(error); 
        
        // שליחת השגיאה המפורטת חזרה ל-React (רק לצורך דיבאג)
        res.status(500).json({ 
            error: "Server Error", 
            message: error.message,
            stack: error.stack 
        });
    }
};

module.exports = { saveCashReport };