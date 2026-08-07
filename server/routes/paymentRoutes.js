const express = require('express');
const router = express.Router();
const { getBanks, verifyAccount } = require('../controllers/paymentController');

router.get('/banks', getBanks);
router.get('/verify-account', verifyAccount);
router.post('/verify-account', verifyAccount);

module.exports = router;

