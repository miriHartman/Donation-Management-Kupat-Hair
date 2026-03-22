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

module.exports = {
    getActiveBranches,
    getAllBranches
};