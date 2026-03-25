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

    deleteBranch: async (req, res) => {
    try {
        const { id } = req.params;

        // קריאה לסרוויס המעודכן שמחזיר אובייקט { success, action, affectedRows }
        const result = await BranchService.deleteBranch(id);

        // בדיקה מה הייתה הפעולה והחזרת הודעה מתאימה
        if (result.action === 'deleted') {
            return res.status(200).json({ 
                message: 'הסניף נמחק לצמיתות מהמערכת כיוון שלא היו לו תרומות משויכות',
                action: 'deleted'
            });
        } else if (result.action === 'deactivated') {
            return res.status(200).json({ 
                message: 'הסניף הושבת בהצלחה (לא נמחק כיוון שקיימות תרומות משויכות)',
                action: 'deactivated'
            });
        }

        // מקרה קצה אם לא נמצא סניף כזה
        res.status(404).json({ message: 'סניף לא נמצא' });

    } catch (error) {
        console.error('Controller Error (deleteBranch):', error);
        res.status(500).json({ 
            message: 'שגיאה בביצוע פעולת המחיקה/השבתה', 
            error: error.message 
        });
    }
}}

module.exports = branchController;
   