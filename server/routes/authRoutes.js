const express = require('express');
const router = express.Router();
const { vendorLogin, vendorSignup, customerLogin, driverLogin } = require('../controllers/authController');

router.post('/vendor/login', vendorLogin);
router.post('/vendor/signup', vendorSignup);
router.post('/customer/login', customerLogin);
router.post('/driver/login', driverLogin);

module.exports = router;
