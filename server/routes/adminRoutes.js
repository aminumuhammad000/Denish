const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  getAllVendors,
  getAllDrivers,
  getAllUsers,
  getAllTransactions,
  getAllDisputes,
  updateVendorStatus,
  updateDriverStatus,
  updateUserStatus,
  updateDisputeStatus,
  addTransaction,
  updateOrder,
  getSettings,
  updateSettings,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  getPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
  getAllData,
  adminLogin
} = require('../controllers/adminController');


// For simplicity in this demo, we're not adding heavy auth middleware yet, 
// but in a real app, you'd protect these routes.

router.post('/login', adminLogin);
router.get('/stats', getDashboardStats);

router.get('/orders', getAllOrders);
router.get('/vendors', getAllVendors);
router.get('/drivers', getAllDrivers);
router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/disputes', getAllDisputes);

router.patch('/vendors/:id/status', updateVendorStatus);
router.patch('/drivers/:id/status', updateDriverStatus);
router.patch('/users/:id/status', updateUserStatus);
router.put('/dispute/:id', updateDisputeStatus);
router.post('/transaction', addTransaction);
router.put('/order/:id', updateOrder);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/banners', getBanners);
router.post('/banners', addBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/promotions', getPromotions);
router.post('/promotions', addPromotion);
router.put('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);

router.get('/all-data', getAllData);

module.exports = router;


