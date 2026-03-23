const BranchService = require('../services/branchService');



const branchController = {
 getActiveBranches : async (req, res) => {
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
},

 getAllBranches : async (req, res) => {
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

// --- פונקציות חדשות שהוספנו ---

 createBranch : async (req, res) => {
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
},

 updateBranch : async (req, res) => {
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
},

     deleteBranch : async (req, res) => {
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
}}

module.exports = branchController;
   