const express = require('express');
const exchangeRateController = require('../controllers/exchangeRateController');
const router = express.Router();

router.get('/', exchangeRateController.getLatestRates);

module.exports = router;