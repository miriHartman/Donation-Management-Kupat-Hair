const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// נתיב ה-GET לשליפת כל הסניפים
router.get('/', branchController.getAllBranches);
router.get('/active', branchController.getActiveBranches); // נתיב חדש לסניפים פעילים בלבד
module.exports = router;