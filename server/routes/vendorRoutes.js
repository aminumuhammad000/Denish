const express = require('express');
const router = express.Router();
const { getVendorDashboard, updateVendorProfile, updateVendorOrderStatus, requestVendorPayout, getVendorTransactions } = require('../controllers/vendorController');
const { getVendorOrders } = require('../controllers/orderController');
const { getVendorMenu, toggleMenuItem, addMenuItem, updateMenuItem } = require('../controllers/menuController');
const { upload } = require('../config/cloudinary');

router.get('/dashboard', getVendorDashboard);
router.put('/profile', updateVendorProfile);
router.post('/payout', requestVendorPayout);
router.get('/orders', getVendorOrders);
router.patch('/orders/:orderId/status', updateVendorOrderStatus);
router.get('/menu', getVendorMenu);
router.post('/menu', addMenuItem);
router.put('/menu/:id', updateMenuItem);
router.put('/menu/:id/toggle', toggleMenuItem);
router.get('/transactions', getVendorTransactions);

router.post('/upload-item-image', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upload-images', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  try {
    const logoUrl = req.files['logo'] ? req.files['logo'][0].path : null;
    const coverUrl = req.files['cover'] ? req.files['cover'][0].path : null;
    res.status(200).json({ success: true, logoUrl, coverUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
