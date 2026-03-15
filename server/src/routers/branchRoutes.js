const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// נתיב ה-GET לשליפת כל הסניפים
router.get('/', branchController.getAllBranches);

module.exports = router;