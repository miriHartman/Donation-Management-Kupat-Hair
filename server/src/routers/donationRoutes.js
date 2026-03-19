const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// ניתוב לקבלת הסטטיסטיקה
router.get('/stats', donationController.getStats);
// ניתוב לקבלת רשימת העסקאות (כולל פילטרים)
router.get('/transactions', donationController.getTransactions);
// נתיבי סניף (Today, Create, Update)
router.get('/today/:branchId', donationController.getTodayDonations);
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.get('/branches', donationController.getBranches);
router.delete('/:id', donationController.deleteDonation); // נתיב למחיקת תרומה
module.exports = router;