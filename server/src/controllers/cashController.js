const cashService = require('../services/cashService');


const cashController = {
    getReport: async (req, res) => {
        try {
            const report = await cashService.getDailyReport(req.params.branchId);
            
            if (!report) {
                return res.status(200).json(null);
            }

            // חישוב לצורכי תצוגה בלבד
            const totalAmount = 
                (Number(report.bills_200 || 0) * 200) + 
                (Number(report.bills_100 || 0) * 100) + 
                (Number(report.bills_50 || 0) * 50) + 
                (Number(report.bills_20 || 0) * 20);

            res.json({
                ...report,
                total_amount: report.total_amount || totalAmount
            });
        } catch (err) {
            console.error("Error in getReport:", err.message);
            res.status(500).json({ error: "שגיאת שרת פנימית" });
        }
    },

    saveCashReport: async (req, res) => {
        try {
            const { recordId } = req.params;
            console.log("📝 saveCashReport called, recordId:", recordId);
            
            let result;
            // בדיקה ש-recordId קיים ואינו 'undefined' כטקסט
            if (recordId && recordId !== 'undefined') {
                result = await cashService.updateReport(recordId, req.body);
            } else {
                result = await cashService.createReport(req.body);
            }
            
            res.json(result);
        } catch (err) {
            console.error("❌ ERROR in saveCashReport:", err.message);
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = cashController;