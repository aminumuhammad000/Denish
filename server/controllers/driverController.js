const Driver = require('../models/Driver');
const axios = require('axios');
const mongoose = require('mongoose');
const { getFlutterwaveAuthHeader } = require('../utils/flutterwave');

const getCurrentDriver = async (req) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const driver = await Driver.findById(userId);
    if (driver) return driver;
  }
  if (userEmail) {
    const driver = await Driver.findOne({ email: userEmail });
    if (driver) return driver;
  }
  return await Driver.findOne();
};

// ─── GET Driver Profile ───────────────────────────────────────────────────────
const getDriverProfile = async (req, res) => {
  try {
    let driver = await getCurrentDriver(req);

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
    } else {
      // Remove sensitive fields
      driver = driver.toObject();
      delete driver.password;
      delete driver.resetPasswordOTP;
      delete driver.resetPasswordExpires;
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
    let driver = await getCurrentDriver(req);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const { name, email, phone, vehicle, bank, documents, profilePic } = req.body;

    if (name)   driver.name = name;
    if (email)  driver.email = email;
    if (phone)  driver.phone = phone;
    if (profilePic) driver.profilePic = profilePic;

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
        bankCode:      bank.bankCode      || driver.bank?.bankCode      || '',
        accountName:   bank.accountName   || driver.bank?.accountName   || '',
        accountNumber: bank.accountNumber || driver.bank?.accountNumber || '',
      };
    }

    if (documents) {
      driver.documents = {
        nationalId:   documents.nationalId   || driver.documents?.nationalId   || null,
        vehiclePhoto: documents.vehiclePhoto || driver.documents?.vehiclePhoto || null,
        license:      documents.license      || driver.documents?.license      || null,
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
    const Order = require('../models/Order');
    const Transaction = require('../models/Transaction');
    const driver = await getCurrentDriver(req);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    // Fetch all delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 });
    const withdrawals = await Transaction.find({ type: 'Driver Payout' }).sort({ createdAt: -1 });

    const totalTrips = deliveredOrders.length;
    
    // Calculate total earned from delivered orders (default delivery fee ₦850 per order if totalAmount not split)
    const orderEarningsSum = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
    const totalWithdrawalsSum = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const totalEarned = (driver.earnings?.totalEarned || 0) + orderEarningsSum;
    const availableBalance = typeof driver.earnings?.availableBalance === 'number' ? driver.earnings.availableBalance : 38500;

    // Calculate Today, This Week, This Month totals
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEarned = deliveredOrders
      .filter(o => new Date(o.createdAt) >= startOfToday)
      .reduce((sum, o) => sum + (o.deliveryFee || 850), 0);

    const weekEarned = deliveredOrders
      .filter(o => new Date(o.createdAt) >= startOfWeek)
      .reduce((sum, o) => sum + (o.deliveryFee || 850), 0);

    const monthEarned = deliveredOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.deliveryFee || 850), 0);

    // Weekly day-by-day chart breakdown (Mon - Sun)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = days.map(d => ({
      day: d,
      amount: deliveredOrders
        .filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === d)
        .reduce((sum, o) => sum + (o.deliveryFee || 850), 0)
    }));

    // Formatted Recent Transactions
    const orderTxns = deliveredOrders.map(o => ({
      id: o.orderId || o._id.toString(),
      type: 'Delivery',
      amount: `₦${(o.deliveryFee || 850).toLocaleString()}`,
      description: `Delivery – ${o.vendorName || 'Restaurant'}`,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' | ' + new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      isWithdrawal: false
    }));

    const wTxns = withdrawals.map(w => ({
      id: w.reference || w._id.toString(),
      type: 'Withdrawal',
      amount: `₦${(w.amount || 0).toLocaleString()}`,
      description: `Withdrawal – ${driver.bank?.name || 'Bank'}`,
      date: new Date(w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' | ' + new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: (w.status || 'completed').toLowerCase(),
      isWithdrawal: true
    }));

    const allTxns = [...orderTxns, ...wTxns].sort((a, b) => new Date(b.date) - new Date(a.date));

    const earningsData = {
      availableBalance: typeof driver.earnings?.availableBalance === 'number' ? driver.earnings.availableBalance : 0,
      totalEarned,
      totalTrips,
      todayEarned,
      weekEarned,
      monthEarned,
      weeklyData,
      recentTransactions: allTxns,
      bank: driver.bank || null,
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
    const rawAmount = req.body.amount;
    const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount || '').replace(/[^0-9.]/g, ''));

    const driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const balance = driver.earnings?.availableBalance ?? 0;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid withdrawal amount' });
    }
    if (amount > balance) {
      return res.status(400).json({ success: false, error: `Insufficient balance. Available: ₦${balance.toLocaleString()}` });
    }

    const { resolveBankCode, initiatePayoutTransfer } = require('../utils/payoutService');
    const bankName = driver.bank?.name || 'GTBank';
    const accountNumber = driver.bank?.accountNumber || '0123456789';
    const bankCode = resolveBankCode(bankName, driver.bank?.bankCode || driver.bank?.code);
    const reference = `DRV_TRF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const flwTransfer = await initiatePayoutTransfer({
      accountBank: bankCode,
      accountNumber: accountNumber,
      amount: amount,
      narration: `Denish Driver Payout to ${driver.name}`,
      reference: reference,
      recipientName: driver.bank?.accountName || driver.name,
    });

    // Deduct balance in DB
    const newBalance = Math.max(0, balance - amount);
    driver.earnings = {
      ...(driver.earnings?.toObject ? driver.earnings.toObject() : driver.earnings),
      availableBalance: newBalance
    };
    driver.markModified('earnings');
    await driver.save();

    // Create Transaction Log in MongoDB
    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.create({
      type: 'Driver Payout',
      from: 'Denish Platform Wallet',
      to: `${driver.name} (${bankName} - ${accountNumber})`,
      amount: amount,
      method: 'Bank Transfer',
      status: flwTransfer.status || 'Completed',
      reference: reference,
    });

    // Create in-app Notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'Withdrawal Initiated 🎉',
        message: `Your withdrawal of ₦${amount.toLocaleString()} to ${bankName} (${accountNumber}) has been submitted. Reference: ${reference}`,
        type: 'payout',
        recipient: 'driver',
        read: false,
      });
    } catch (notifErr) {
      console.warn('Driver payout notification notice:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `₦${amount.toLocaleString()} payout initiated to ${bankName} (${accountNumber}).`,
      newBalance: driver.earnings.availableBalance,
      reference,
      mode: flwTransfer.mode,
      data: {
        transaction,
        availableBalance: newBalance,
      }
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
    
    // Fetch live orders from MongoDB with populated Vendor data
    const allOrders = await Order.find().populate('vendorId').sort({ createdAt: -1 });

    const availableOrders = allOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
    const activeOrders = allOrders.filter(o => ['assigned', 'on the way'].includes(o.status));
    const completedOrders = allOrders.filter(o => o.status === 'delivered');

    const formattedAvailable = availableOrders.map(o => ({
      id: o.orderId || o._id.toString(),
      _id: o._id.toString(),
      restaurant: o.vendorId?.businessName || o.vendorName || 'Spice Avenue',
      customer: o.customerName || 'Customer',
      pickupAddress: o.vendorId?.address || '15 Admiralty Way, Lekki',
      dropoffAddress: o.deliveryAddress || o.address || '12 Marina Road, Lagos Island',
      status: o.status === 'preparing' ? 'Preparing at restaurant' : 'New delivery request',
      amount: o.deliveryFee || 850,
      totalAmount: o.totalAmount || o.total || 5700,
      distance: '3.5 km'
    }));

    const formattedActive = activeOrders.map(o => ({
      id: o.orderId || o._id.toString(),
      _id: o._id.toString(),
      restaurant: o.vendorId?.businessName || o.vendorName || 'Spice Avenue',
      customer: o.customerName || 'Customer',
      pickupAddress: o.vendorId?.address || '15 Admiralty Way, Lekki',
      dropoffAddress: o.deliveryAddress || o.address || '12 Marina Road, Lagos Island',
      status: o.status === 'on the way' ? 'En route to customer' : 'Order picked up',
      amount: o.deliveryFee || 850,
      totalAmount: o.totalAmount || o.total || 5700,
      distance: '2.1 km'
    }));

    const formattedCompleted = completedOrders.map(o => ({
      id: o.orderId || o._id.toString(),
      _id: o._id.toString(),
      restaurant: o.vendorId?.businessName || o.vendorName || 'Spice Avenue',
      customer: o.customerName || 'Customer',
      dropoffAddress: o.deliveryAddress || o.address || 'Customer Address',
      amount: o.deliveryFee || 850,
      totalAmount: o.totalAmount || o.total || 5700,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const deliveries = {
      available: formattedAvailable,
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
      $or: [
        { recipient: { $in: ['driver', 'all'] } },
        { recipient: { $exists: false } },
        { recipient: null }
      ]
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
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Notification.findByIdAndUpdate(id, { read: true });
    } else {
      await Notification.updateOne({ _id: id }, { read: true });
    }
    res.status(200).json({ success: true, message: 'Notification marked as read' });
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
      { 
        $or: [
          { recipient: { $in: ['driver', 'all'] } },
          { recipient: { $exists: false } },
          { recipient: null }
        ],
        read: false 
      },
      { read: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllDriverNotificationsRead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Chat Threads ───────────────────────────────────────────────────
const getDriverChats = async (req, res) => {
  try {
    const Message = require('../models/Message');
    let driver = await getCurrentDriver(req);
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
    const driver = await getCurrentDriver(req);
    const driverName = driver ? driver.name : 'Bayo Adeyemi';

    const messages = await Message.find({
      $or: [
        { senderName: driverName, recipientName: recipientName },
        { senderName: recipientName, recipientName: driverName }
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
    let driver = await getCurrentDriver(req);

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

// ─── UPDATE Driver Order Status ───────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'on the way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    const order = await Order.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }, { orderId: orderId }]
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // If order status is marked as 'delivered', update driver earnings in DB
    if (status === 'delivered') {
      const driver = await Driver.findOne();
      if (driver) {
        const fee = order.deliveryFee || 850;
        driver.earnings = {
          totalEarned: (driver.earnings?.totalEarned || 0) + fee,
          availableBalance: (driver.earnings?.availableBalance || 0) + fee,
          totalTrips: (driver.earnings?.totalTrips || 0) + 1,
        };
        driver.markModified('earnings');
        await driver.save();
      }
    }

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
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
  updateOrderStatus,
};
