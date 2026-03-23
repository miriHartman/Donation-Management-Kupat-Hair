const express = require('express');
const router = express.Router();
const cashController = require('../controllers/cashController');

router.get('/:branchId', cashController.getReport); // שליפה
router.post('/', cashController.saveCashReport);    // יצירה
router.put('/:recordId', cashController.saveCashReport); // עדכון

module.exports = router;