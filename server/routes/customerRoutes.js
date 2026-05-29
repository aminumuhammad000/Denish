const express = require('express');
const router = express.Router();
const { getRestaurantDetails, placeOrder } = require('../controllers/customerController');

router.get('/restaurant/:id', getRestaurantDetails);
router.post('/order', placeOrder);

module.exports = router;
