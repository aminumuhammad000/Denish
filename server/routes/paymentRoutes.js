const express = require('express');
const router = express.Router();
const { getBanks, verifyAccount } = require('../controllers/paymentController');
const { flutterwaveWebhook } = require('../controllers/customerController');

router.get('/banks', getBanks);
router.get('/verify-account', verifyAccount);
router.post('/verify-account', verifyAccount);
router.post('/flw-webhook', flutterwaveWebhook);
router.post('/webhook', flutterwaveWebhook);

module.exports = router;

