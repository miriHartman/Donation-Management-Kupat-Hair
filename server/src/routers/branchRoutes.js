const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// נתיב ה-GET לשליפת כל הסניפים
router.get('/', branchController.getAllBranches);
router.put('/:id', branchController.updateBranch);
router.post('/', branchController.createBranch);
router.delete('/:id', branchController.deleteBranch); // נתיב למחיקת סניף - בהתאם להחלטה על מחיקה סופית או השבתה
module.exports = router;