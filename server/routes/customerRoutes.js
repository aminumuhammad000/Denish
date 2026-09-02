const express = require('express');
const router = express.Router();
const { 
  getRestaurants, getRestaurantDetails, placeOrder, getCustomerProfile, 
  updateCustomerProfile, getCustomerOrders, search, addAddress, 
  addPaymentMethod, deleteAddress, deletePaymentMethod, getOrderTracking, 
  getChatThreads, getMessages, sendMessage, initiateCall, getIncomingCall, 
  getCallStatus, respondCall, initializeFlutterwavePayment, 
  verifyFlutterwavePayment, flutterwaveWebhook,
  getCustomerNotifications, markCustomerNotificationRead, markAllCustomerNotificationsRead
} = require('../controllers/customerController');
const { upload } = require('../config/cloudinary');

router.get('/restaurants', getRestaurants);
router.get('/restaurant/:id', getRestaurantDetails);
router.get('/search', search);
router.post('/order', placeOrder);
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);
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

router.post('/flw/initialize', initializeFlutterwavePayment);
router.post('/flw/verify', verifyFlutterwavePayment);
router.post('/flw/webhook', flutterwaveWebhook);
router.get('/flw/callback', (req, res) => {
  res.send(`
    <!Platform html>
    <html>
      <head>
        <title>Payment Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px 20px; background-color: #F8F9FA; }
          .card { background: #FFF; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 380px; margin: 0 auto; }
          .icon { width: 64px; height: 64px; background: #E6F7F0; color: #27A572; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
          h2 { color: #1A1A1A; margin: 0 0 8px; font-size: 20px; }
          p { color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h2>Payment Completed</h2>
          <p>Your Flutterwave transaction has been processed successfully. You may close this window.</p>
        </div>
      </body>
    </html>
  `);
});

router.post('/upload-profile-pic', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
