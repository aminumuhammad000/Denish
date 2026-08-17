const express = require('express');
const router = express.Router();
const { vendorLogin, vendorSignup, customerLogin, customerSignup, driverLogin, driverSignup, forgotPassword, verifyOTP, resetPassword, googleAuth } = require('../controllers/authController');

router.post('/vendor/login', vendorLogin);
router.post('/vendor/signup', vendorSignup);
router.post('/customer/login', customerLogin);
router.post('/customer/signup', customerSignup);
router.post('/driver/login', driverLogin);
router.post('/driver/signup', driverSignup);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

module.exports = router;
