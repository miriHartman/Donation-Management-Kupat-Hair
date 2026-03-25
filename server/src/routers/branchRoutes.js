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

// מחיקת הסניף אם אין תרומות על ידו , אחרת רק שינוי סטטוס ללא מחיקה
router.delete('/:id', branchController.deleteBranch);

module.exports = router;