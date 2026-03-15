const express = require('express');
const router = express.Router();
const cashController = require('../controllers/cashController'); 


router.post('/', cashController.saveCashReport);
module.exports = router;