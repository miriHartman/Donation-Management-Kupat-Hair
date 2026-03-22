const BranchService = require('../services/branchService');

const getActiveBranches = async (req, res) => {
    try {
        const branches = await BranchService.getActiveBranches();
        res.status(200).json(branches);
    } catch (error) {
        console.error('Controller Error (getActiveBranches):', error);
        res.status(500).json({ 
            message: 'שגיאה בשליפת רשימת הסניפים', 
            error: error.message 
        });
    }
};

const getAllBranches = async (req, res) => {
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
};

// --- פונקציות חדשות שהוספנו ---

const createBranch = async (req, res) => {
    try {
        // המידע מגיע מה-body של הבקשה (שם, כתובת, טלפון, סטטוס)
        const newBranch = await BranchService.createBranch(req.body);
        res.status(201).json(newBranch);
    } catch (error) {
        console.error('Controller Error (createBranch):', error);
        res.status(500).json({ 
            message: 'שגיאה ביצירת סניף חדש', 
            error: error.message 
        });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBranch = await BranchService.updateBranch(id, req.body);
        res.status(200).json(updatedBranch);
    } catch (error) {
        console.error('Controller Error (updateBranch):', error);
        res.status(500).json({ 
            message: 'שגיאה בעדכון פרטי הסניף', 
            error: error.message 
        });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        // כזכור, בסרוויס הפונקציה הזו רק מעדכנת is_active = 0
        await BranchService.deleteBranch(id);
        res.status(200).json({ message: 'הסניף הושבת בהצלחה' });
    } catch (error) {
        console.error('Controller Error (deleteBranch):', error);
        res.status(500).json({ 
            message: 'שגיאה במחיקת/השבתת הסניף', 
            error: error.message 
        });
    }
};

module.exports = {
    getActiveBranches,
    getAllBranches,
    createBranch,   
    updateBranch,
    deleteBranch
};