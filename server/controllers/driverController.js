const Driver = require('../models/Driver');

// ─── GET Driver Profile ───────────────────────────────────────────────────────
const getDriverProfile = async (req, res) => {
  try {
    // In production: use req.user._id from JWT middleware.
    // For now, find the first driver that exists (demo mode).
    let driver = await Driver.findOne().select('-password -resetPasswordOTP -resetPasswordExpires');

    if (!driver) {
      // Seed a demo driver so the screen never breaks
      driver = await Driver.create({
        name: 'Bayo Adeyemi',
        email: 'bayo@denish.ng',
        phone: '08012345678',
        password: 'demo',
        vehicleType: 'Motorcycle',
        vehicle: { type: 'Motorcycle', make: 'Honda CB500', plate: 'LAG-234-BA', color: 'Red' },
        bank: { name: 'GTBank', accountName: 'Bayo Adeyemi', accountNumber: '0123456789' },
        status: 'Active',
      });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    console.error('getDriverProfile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── UPDATE Driver Profile ────────────────────────────────────────────────────
const updateDriverProfile = async (req, res) => {
  try {
    let driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const { name, email, phone, vehicle, bank } = req.body;

    if (name)   driver.name = name;
    if (email)  driver.email = email;
    if (phone)  driver.phone = phone;

    if (vehicle) {
      driver.vehicle = {
        type:  vehicle.type  || driver.vehicle?.type  || '',
        make:  vehicle.make  || driver.vehicle?.make  || '',
        plate: vehicle.plate || driver.vehicle?.plate || '',
        color: vehicle.color || driver.vehicle?.color || '',
      };
      // Keep top-level vehicleType in sync
      if (vehicle.type) driver.vehicleType = vehicle.type;
    }

    if (bank) {
      driver.bank = {
        name:          bank.name          || driver.bank?.name          || '',
        accountName:   bank.accountName   || driver.bank?.accountName   || '',
        accountNumber: bank.accountNumber || driver.bank?.accountNumber || '',
      };
    }

    await driver.save();
    const updated = driver.toObject();
    delete updated.password;
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error) {
    console.error('updateDriverProfile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Earnings ──────────────────────────────────────────────────────
const getDriverEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    // Demo earnings data – in production this would come from a Delivery model
    const earningsData = {
      availableBalance: driver.earnings?.availableBalance || 62500,
      totalEarned:      driver.earnings?.totalEarned      || 248000,
      totalTrips:       driver.earnings?.totalTrips       || 97,
      weeklyData: [
        { day: 'Mon', amount: 8500  },
        { day: 'Tue', amount: 12000 },
        { day: 'Wed', amount: 9800  },
        { day: 'Thu', amount: 15000 },
        { day: 'Fri', amount: 7200  },
        { day: 'Sat', amount: 6500  },
        { day: 'Sun', amount: 3500  },
      ],
      recentTransactions: [
        { id: 'TXN-001', type: 'delivery', amount: 850,  description: 'Delivery – Spice Avenue',  date: 'Today, 2:34 PM',   status: 'completed' },
        { id: 'TXN-002', type: 'delivery', amount: 750,  description: 'Delivery – Mbadiwe Axis',  date: 'Today, 11:15 AM',  status: 'completed' },
        { id: 'TXN-003', type: 'withdrawal', amount: -25000, description: 'Withdrawal – GTBank', date: 'Yesterday',         status: 'completed' },
        { id: 'TXN-004', type: 'delivery', amount: 1250, description: 'Delivery – Ojokwu Ave',    date: 'Jun 3, 4:00 PM',   status: 'completed' },
      ],
    };

    res.status(200).json({ success: true, data: earningsData });
  } catch (error) {
    console.error('getDriverEarnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── WITHDRAW Earnings ────────────────────────────────────────────────────────
const withdrawEarnings = async (req, res) => {
  try {
    const { amount } = req.body;
    const driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const balance = driver.earnings?.availableBalance || 0;
    if (amount > balance) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    driver.earnings.availableBalance = balance - amount;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `₦${amount.toLocaleString()} withdrawal initiated to ${driver.bank?.name || 'your bank'}.`,
      newBalance: driver.earnings.availableBalance,
    });
  } catch (error) {
    console.error('withdrawEarnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Deliveries ────────────────────────────────────────────────────
const getDriverDeliveries = async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    // Fetch live orders from MongoDB
    const allOrders = await Order.find().populate('vendorId').sort({ createdAt: -1 });

    const activeOrders = allOrders.filter(o => ['pending', 'preparing', 'ready', 'assigned', 'on the way'].includes(o.status));
    const completedOrders = allOrders.filter(o => o.status === 'delivered');

    const formattedActive = activeOrders.map(o => ({
      id: o.orderId || o._id,
      _id: o._id,
      restaurant: o.vendorId?.businessName || o.vendorName || 'Mama\'s Kitchen',
      customer: o.customerName || 'Customer',
      pickupAddress: o.vendorId?.address || '15 Admiralty Way, Lekki',
      dropoffAddress: o.deliveryAddress || o.address || 'Customer Address',
      status: o.status === 'on the way' ? 'En route to customer' : o.status === 'preparing' ? 'Preparing at restaurant' : 'Ready for pickup',
      amount: o.totalAmount || o.total || 750,
      distance: '3.5 km'
    }));

    const formattedCompleted = completedOrders.map(o => ({
      id: o.orderId || o._id,
      _id: o._id,
      restaurant: o.vendorId?.businessName || o.vendorName || 'Mama\'s Kitchen',
      customer: o.customerName || 'Customer',
      amount: o.totalAmount || o.total || 750,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const deliveries = {
      available: formattedActive.filter(o => o.status === 'Ready for pickup'),
      active: formattedActive,
      completed: formattedCompleted
    };

    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    console.error('getDriverDeliveries error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Notifications ────────────────────────────────────────────────
const getDriverNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      recipient: { $in: ['driver', 'all'] }
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('getDriverNotifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── MARK Single Driver Notification as Read ─────────────────────────────────
const markDriverNotificationRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('markDriverNotificationRead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── MARK ALL Driver Notifications as Read ───────────────────────────────────
const markAllDriverNotificationsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { recipient: { $in: ['driver', 'all'] }, read: false },
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('markAllDriverNotificationsRead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Chat Threads ───────────────────────────────────────────────────
const getDriverChats = async (req, res) => {
  try {
    const Message = require('../models/Message');
    let driver = await Driver.findOne();
    const driverId = driver ? driver._id.toString() : 'driver-1';
    const driverName = driver ? driver.name : 'Bayo Adeyemi';

    const messages = await Message.find({
      $or: [
        { senderId: driverId },
        { recipientId: driverId },
        { senderName: driverName },
        { recipientName: driverName }
      ]
    }).sort({ createdAt: -1 });

    const threadMap = {};
    messages.forEach(msg => {
      const isSender = msg.senderName === driverName || msg.senderId === driverId;
      const otherName = isSender ? msg.recipientName : msg.senderName;
      const otherId = isSender ? msg.recipientId : msg.senderId;

      if (!threadMap[otherName]) {
        let avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100';
        if (otherName.toLowerCase().includes('kitchen') || otherName.toLowerCase().includes('restaurant') || otherName.toLowerCase().includes('spicy')) {
          avatar = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100';
        } else if (otherName.toLowerCase().includes('support')) {
          avatar = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100';
        }

        threadMap[otherName] = {
          id: otherId || otherName,
          name: otherName,
          lastMsg: msg.text || (msg.imageUrl ? '📷 Image' : 'Voice Call'),
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: (!msg.read && !isSender) ? 1 : 0,
          avatar
        };
      }
    });

    const threads = Object.values(threadMap);
    res.status(200).json({ success: true, threads });
  } catch (error) {
    console.error('getDriverChats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Messages for a Specific Contact ───────────────────────────────
const getDriverMessages = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const { recipientName } = req.query;
    const messages = await Message.find({
      $or: [
        { recipientName },
        { senderName: recipientName }
      ]
    }).sort({ createdAt: 1 });

    const formatted = messages.map(m => ({
      id: m._id,
      text: m.text,
      image: m.imageUrl,
      type: m.type,
      subText: m.subText,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: m.senderName === recipientName ? 'them' : 'me'
    }));

    res.status(200).json({ success: true, messages: formatted });
  } catch (error) {
    console.error('getDriverMessages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── SEND Driver Message ──────────────────────────────────────────────────────
const sendDriverMessage = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const { recipientName, text, imageUrl, type, subText } = req.body;
    let driver = await Driver.findOne();

    const newMsg = await Message.create({
      senderId: driver ? driver._id.toString() : 'driver-1',
      senderName: driver ? driver.name : 'Bayo Adeyemi',
      recipientId: 'chat-partner',
      recipientName: recipientName || "John Doe (Customer)",
      text,
      imageUrl,
      type: type || 'text',
      subText
    });

    res.status(200).json({ success: true, data: newMsg });
  } catch (error) {
    console.error('sendDriverMessage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
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
};
