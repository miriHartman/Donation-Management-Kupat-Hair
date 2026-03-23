const cashService = require('../services/cashService');


const cashController = {
getReport : async (req, res) => {
    try {
        const report = await cashService.getDailyReport(req.params.branchId);
        if (!report) return res.status(404).json({ message: "לא נמצא סיכום" });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
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