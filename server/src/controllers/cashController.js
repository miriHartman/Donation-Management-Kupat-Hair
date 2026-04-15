const cashService = require('../services/cashService');


const cashController = {
getReport: async (req, res) => {
    try {
        const report = await cashService.getDailyReport(req.params.branchId);
        
        // אם report הוא null או שהמערך ריק
        if (!report || (Array.isArray(report) && report.length === 0)) {
            // אנחנו מחזירים null בסטטוס 200. 
            // זה מונע את השורה האדומה ב-Console וגם שומר על ה-React יציב.
            console.log(`No report found for branchId ${req.params.branchId} for this date.`);
            return res.status(200).json(null);
        }

        // חישוב total_amount אם לא קיים
        const totalAmount = 
            (report.bills_200 * 200) + 
            (report.bills_100 * 100) + 
            (report.bills_50 * 50) + 
            (report.bills_20 * 20);

        // שלח את הדיווח עם total_amount מחושב
        res.json({
            ...report,
            total_amount: totalAmount
        });
    } catch (err) {
        console.error("Error in getReport:", err.message);
        res.status(500).json({ error: "שגיאת שרת פנימית" });
    }
},

saveCashReport : async (req, res) => {
    try {
        const { recordId } = req.params; // אם מגיע מה-Route של ה-PUT
        let result;

        if (recordId) {
            result = await cashService.updateReport(recordId, req.body);
        } else {
            result = await cashService.createReport(req.body);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}}

module.exports = cashController;