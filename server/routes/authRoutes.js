const express = require('express');
const router = express.Router();
const { vendorLogin, vendorSignup, customerLogin, customerSignup, driverLogin, driverSignup, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/vendor/login', vendorLogin);
router.post('/vendor/signup', vendorSignup);
router.post('/customer/login', customerLogin);
router.post('/customer/signup', customerSignup);
router.post('/driver/login', driverLogin);
router.post('/driver/signup', driverSignup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
