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
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSystemContent,
  updateSystemContent,
  deleteUser,
  deleteVendor,
  deleteDriver,
  deleteCustomer,
  approveVendor,
  approveDriver,
  getPayoutOverviewAdmin,
  triggerNightlyVendorPayoutsAdmin,
  triggerWeeklyRiderPayoutsAdmin,
  triggerReconciliationAdmin,
  getAllPayoutsAdmin,
} = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');
const { getVendorMenuById } = require('../controllers/menuController');


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
router.get('/vendors/:vendorId/menu', getVendorMenuById);
router.get('/vendors/:vendorId/menu-items', getVendorMenuById);

router.patch('/vendors/:id/status', updateVendorStatus);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/verify', approveVendor);
router.delete('/vendors/:id', deleteVendor);

router.patch('/drivers/:id/status', updateDriverStatus);
router.patch('/drivers/:id/approve', approveDriver);
router.patch('/drivers/:id/verify', approveDriver);
router.delete('/drivers/:id', deleteDriver);

router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.delete('/customers/:id', deleteCustomer);
router.put('/dispute/:id', updateDisputeStatus);
router.post('/transaction', addTransaction);
router.put('/order/:id', updateOrder);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Payout Management routes
router.get('/payouts', getAllPayoutsAdmin);
router.get('/payouts/status', getPayoutOverviewAdmin);
router.post('/payouts/process-nightly-vendors', triggerNightlyVendorPayoutsAdmin);
router.post('/payouts/vendors/trigger', triggerNightlyVendorPayoutsAdmin);
router.post('/payouts/process-weekly-riders', triggerWeeklyRiderPayoutsAdmin);
router.post('/payouts/drivers/trigger', triggerWeeklyRiderPayoutsAdmin);
router.post('/payouts/reconcile', triggerReconciliationAdmin);

router.get('/banners', getBanners);
router.post('/banners', addBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/promotions', getPromotions);
router.post('/promotions', addPromotion);
router.put('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);

router.get('/all-data', getAllData);
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/read-all', markAllNotificationsAsRead);

router.get('/content/:key', getSystemContent);
router.put('/content/:key', updateSystemContent);

// Image upload route
router.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.status(200).json({ success: true, url: req.file.path });
  } else {
    res.status(400).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;


