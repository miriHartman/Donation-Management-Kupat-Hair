const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// --- נתיבי GET (הקיימים שלך) ---
router.get('/', branchController.getAllBranches);
router.get('/active', branchController.getActiveBranches); // נתיב חדש לסניפים פעילים בלבד


// יצירת סניף חדש
router.post('/', branchController.createBranch);

// עדכון סניף קיים לפי מזהה (ID)
router.put('/:id', branchController.updateBranch);

// השבתת סניף (מחיקה רכה) לפי מזהה (ID)
router.delete('/:id', branchController.deleteBranch);

module.exports = router;