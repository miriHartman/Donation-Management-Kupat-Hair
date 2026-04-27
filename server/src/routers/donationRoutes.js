const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/stats', donationController.getStats);
router.get('/transactions', donationController.getTransactions);
router.get('/today/:branchId', donationController.getTodayDonations);
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.delete('/:id', donationController.deleteDonation); 
router.get('/cash/:branchId', donationController.getAmountDonationCash);
router.get('/funds', donationController.getFundsDonations);

module.exports = router;