const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantDetails, placeOrder, getCustomerProfile, updateCustomerProfile, getCustomerOrders, search } = require('../controllers/customerController');
const { upload } = require('../config/cloudinary');

router.get('/restaurants', getRestaurants);
router.get('/restaurant/:id', getRestaurantDetails);
router.get('/search', search);
router.post('/order', placeOrder);
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);
router.get('/orders', getCustomerOrders);

router.post('/upload-profile-pic', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
