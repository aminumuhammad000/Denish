const express = require('express');
const router = express.Router();
const {
  getDriverProfile,
  updateDriverProfile,
  getDriverEarnings,
  withdrawEarnings,
  getDriverDeliveries,
  getDriverNotifications,
  markDriverNotificationRead,
  markAllDriverNotificationsRead,
  getDriverChats,
  getDriverMessages,
  sendDriverMessage,
  updateOrderStatus,
} = require('../controllers/driverController');
const { upload } = require('../config/cloudinary');

router.get('/profile', getDriverProfile);
router.put('/profile', updateDriverProfile);
router.get('/earnings', getDriverEarnings);
router.post('/withdraw', withdrawEarnings);
router.get('/deliveries', getDriverDeliveries);
router.patch('/order/:orderId/status', updateOrderStatus);

// Notification routes
router.get('/notifications', getDriverNotifications);
router.patch('/notifications/read-all', markAllDriverNotificationsRead);
router.patch('/notifications/:id/read', markDriverNotificationRead);

// Chat routes
router.get('/chats', getDriverChats);
router.get('/messages', getDriverMessages);
router.post('/messages', sendDriverMessage);

// Profile pic upload
router.post('/upload-profile-pic', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const imageUrl = req.file.path;

    // Update driver profile pic asynchronously
    const Driver = require('../models/Driver');
    Driver.findOne().then(driver => {
      if (driver) {
        driver.profilePic = imageUrl;
        driver.save();
      }
    });

    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
