const BranchService = require('../services/branchService');

const branchController = {
    getAllBranches: async (req, res) => {
        try {
            const branches = await BranchService.getAllBranches();
            res.status(200).json(branches);
        } catch (error) {
            console.error('Controller Error (getAllBranches):', error);
            res.status(500).json({ 
                message: 'שגיאה בשליפת רשימת הסניפים', 
                error: error.message 
            });
        }
    },

    createBranch: async (req, res) => {
        try {
            const branch = await BranchService.createBranch(req.body);
            res.status(201).json(branch);
        } catch (error) {
            console.error('Controller Error (createBranch):', error);
            res.status(500).json({ 
                message: 'שגיאה ביצירת סניף חדש', 
                error: error.message 
            });
        }
    },

    updateBranch: async (req, res) => {
        try {
            const { id } = req.params;
            const branch = await BranchService.updateBranch(id, req.body);
            if (!branch) {
                return res.status(404).json({ message: 'סניף לא נמצא' });
            }
            res.status(200).json(branch);
        } catch (error) {
            console.error('Controller Error (updateBranch):', error);
            res.status(500).json({ 
                message: 'שגיאה בעדכון פרטי הסניף', 
                error: error.message 
            });
        }
    },

    deleteBranch: async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BranchService.deleteBranch(id);
        
        if (!result) {
            return res.status(404).json({ message: 'סניף לא נמצא' });
        }
        
        // ← החזר את ה-result המלא כדי שהפרונט ידע מה קרה
        res.status(200).json(result);
    } catch (error) {
        console.error('Controller Error (deleteBranch):', error);
        res.status(500).json({ 
            message: 'שגיאה במחיקת הסניף', 
            error: error.message 
        });
        }
    }
};

// חשוב מאוד: לייצא את האובייקט כולו כדי שהראוטר יוכל להשתמש ב-branchController.deleteBranch
module.exports = branchController;