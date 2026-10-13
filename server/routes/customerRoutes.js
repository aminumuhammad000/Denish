const express = require('express');
const router = express.Router();
const { 
  getPlatformSettings,
  getRestaurants, getRestaurantDetails, placeOrder, getCustomerProfile, 
  updateCustomerProfile, getCustomerOrders, search, addAddress, 
  addPaymentMethod, deleteAddress, deletePaymentMethod, getOrderTracking, 
  getChatThreads, getMessages, sendMessage, initiateCall, getIncomingCall, 
  getCallStatus, respondCall, sendCallSignal, getCallSignals, getCallLogs, initializeFlutterwavePayment, 
  verifyFlutterwavePayment, flutterwaveWebhook,
  getCustomerNotifications, markCustomerNotificationRead, markAllCustomerNotificationsRead,
  getCustomerWallet, fundCustomerWallet, redeemLoyaltyPoints, handleFlutterwaveCallback
} = require('../controllers/customerController');
const { upload } = require('../config/cloudinary');

router.get('/platform-settings', getPlatformSettings);
router.get('/restaurants', getRestaurants);
router.get('/restaurant/:id', getRestaurantDetails);
router.get('/search', search);
router.post('/order', placeOrder);
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);
router.get('/wallet', getCustomerWallet);
router.post('/wallet/fund', fundCustomerWallet);
router.post('/loyalty/redeem', redeemLoyaltyPoints);
router.post('/add-address', addAddress);
router.delete('/address/:addressId', deleteAddress);
router.post('/add-payment-method', addPaymentMethod);
router.delete('/payment-method/:paymentId', deletePaymentMethod);
router.get('/order/:id/tracking', getOrderTracking);
router.get('/orders', getCustomerOrders);

// Notification routes
router.get('/notifications', getCustomerNotifications);
router.patch('/notifications/read-all', markAllCustomerNotificationsRead);
router.patch('/notifications/:id/read', markCustomerNotificationRead);

router.get('/chats', getChatThreads);
router.get('/messages', getMessages);
router.post('/messages', sendMessage);

router.post('/call/initiate', initiateCall);
router.get('/call/incoming', getIncomingCall);
router.get('/call/status/:callId', getCallStatus);
router.post('/call/respond', respondCall);
router.post('/call/signal', sendCallSignal);
router.get('/call/signals/:callId', getCallSignals);
router.get('/call/logs', getCallLogs);

router.post('/flw/initialize', initializeFlutterwavePayment);
router.post('/flw/verify', verifyFlutterwavePayment);
router.post('/flw/webhook', flutterwaveWebhook);
router.get('/flw/callback', handleFlutterwaveCallback);

router.post('/upload-profile-pic', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
