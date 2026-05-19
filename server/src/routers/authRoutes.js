const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/list', authController.getAllUsers); 
router.post('/create', authController.createUser);

module.exports = router;