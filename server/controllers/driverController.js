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
    let driver = await getCurrentDriver(req);
    if (!driver) {
      driver = await Driver.create({
        name: 'Bayo Adeyemi',
        email: 'bayo@denish.ng',
        phone: '08012345678',
        password: 'demo',
        vehicleType: 'Motorcycle',
        vehicle: { type: 'Motorcycle', make: 'Honda CB500', plate: 'LAG-234-BA', color: 'Red' },
        bank: { name: 'GTBank', accountName: 'Bayo Adeyemi', accountNumber: '0123456789' },
        status: 'Active',
        earnings: { totalEarned: 248000, availableBalance: 62500, totalTrips: 97 },
      });
    }

    // Release any 7-day matured driver earnings first
    const { releaseMaturedDriverEarnings } = require('../utils/payoutScheduler');
    await releaseMaturedDriverEarnings();
    driver = (await Driver.findById(driver._id)) || driver;

    // Fetch all delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 });
    const withdrawals = await Transaction.find({ type: 'Driver Payout' }).sort({ createdAt: -1 });

    const totalTrips = deliveredOrders.length;
    
    // Calculate total earned from delivered orders (default delivery fee ₦850 per order if totalAmount not split)
    const orderEarningsSum = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
    const totalWithdrawalsSum = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const totalEarned = (driver.earnings?.totalEarned || 0) + orderEarningsSum;
    const availableBalance = typeof driver.earnings?.availableBalance === 'number' ? driver.earnings.availableBalance : 0;
    const pendingBalance = typeof driver.earnings?.pendingBalance === 'number' ? driver.earnings.pendingBalance : 0;

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
      availableBalance,
      pendingBalance,
      unpaidEarnings: driver.earnings?.unpaidEarnings || [],
      totalEarned,
      totalTrips,
      todayEarned,
      weekEarned,
      monthEarned,
      weeklyData,
      recentTransactions: allTxns,
      bank: driver.bank || null,
      payoutSchedule: {
        cycle: 'weekly',
        day: 'Sunday',
        time: '23:59 WAT',
        frequencyText: 'Every Sunday at 11:59 PM',
        description: 'Automated weekly payouts are processed every Sunday night directly to your registered bank account for earnings held beyond the 7-day maturity period.'
      },
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

    let driver = await getCurrentDriver(req);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    // Release any 7-day matured earnings first
    const { releaseMaturedDriverEarnings } = require('../utils/payoutScheduler');
    await releaseMaturedDriverEarnings();
    driver = (await Driver.findById(driver._id)) || driver;

    const balance = Number(driver.earnings?.availableBalance || 0);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid withdrawal amount' });
    }
    if (amount > balance) {
      return res.status(400).json({ success: false, error: `Insufficient available balance. Available: ₦${balance.toLocaleString()}` });
    }

    const bankName = driver.bank?.name || 'GTBank';
    const accountNumber = driver.bank?.accountNumber;
    if (!accountNumber || String(accountNumber).trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Driver bank account details are missing or invalid' });
    }

    const { resolveBankCode, verifyPayoutAccount, initiatePayoutTransfer } = require('../utils/payoutService');
    const bankCode = resolveBankCode(bankName, driver.bank?.bankCode || driver.bank?.code);

    // 1. Verify account details with Flutterwave resolve API
    const verification = await verifyPayoutAccount({ accountNumber, bankCode });
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: `Bank verification failed: ${verification.message}`
      });
    }

    const accountName = verification.accountName || driver.bank?.accountName || driver.name;
    const reference = `DRV_MAN_${driver._id}_${Date.now()}`;

    // 2. Atomically deduct availableBalance to avoid race conditions
    const updatedDriver = await Driver.findOneAndUpdate(
      {
        _id: driver._id,
        'earnings.availableBalance': { $gte: amount }
      },
      {
        $inc: { 'earnings.availableBalance': -amount },
        $set: { 'earnings.lastPayoutAt': new Date() }
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(400).json({ success: false, error: 'Balance changed concurrently. Please try again.' });
    }

    // 3. Create initial Payout record in PENDING state
    const Payout = require('../models/Payout');
    const payoutRecord = await Payout.create({
      providerType: 'Driver',
      providerId: driver._id,
      providerName: driver.name,
      amount: amount,
      currency: 'NGN',
      bank: {
        name: bankName,
        code: bankCode,
        accountNumber,
        accountName,
      },
      reference,
      status: 'PENDING',
      narration: `Connecta Rider Withdrawal - ${driver.name}`,
      cycle: 'manual',
      initiatedBy: 'driver_app',
      processedAt: new Date(),
    });

    // 4. Submit transfer to Flutterwave Transfer API
    const flwTransfer = await initiatePayoutTransfer({
      accountBank: bankCode,
      accountNumber,
      amount,
      narration: `Connecta Rider Payout - ${driver.name}`,
      reference,
      recipientName: accountName,
    });

    payoutRecord.flwTransferId = flwTransfer.transferId || null;
    payoutRecord.fee = flwTransfer.fee || 0;
    payoutRecord.flwResponse = flwTransfer.raw || flwTransfer.rawError || null;

    const Transaction = require('../models/Transaction');

    if (flwTransfer.status === 'SUCCESSFUL') {
      payoutRecord.status = 'SUCCESSFUL';
      payoutRecord.completedAt = new Date();
      await payoutRecord.save();

      const transaction = await Transaction.create({
        type: 'Driver Payout',
        from: 'Connecta Platform Wallet',
        to: `${driver.name} (${bankName} - ${accountNumber})`,
        amount: amount,
        method: 'Bank Transfer',
        status: 'Completed',
        reference,
      });

      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Withdrawal Successful 🎉',
          message: `Your withdrawal of ₦${amount.toLocaleString()} to ${bankName} (${accountNumber}) has been sent. Reference: ${reference}`,
          type: 'payout',
          recipient: 'driver',
          read: false,
        });
      } catch (notifErr) { /* non-fatal */ }

      return res.status(200).json({
        success: true,
        message: `₦${amount.toLocaleString()} payout sent to ${bankName} (${accountNumber}).`,
        reference,
        status: 'SUCCESSFUL',
        data: {
          transaction,
          availableBalance: updatedDriver.earnings.availableBalance,
          payout: payoutRecord,
        }
      });

    } else if (flwTransfer.status === 'PROCESSING') {
      payoutRecord.status = 'PROCESSING';
      if (flwTransfer.isUncertain) {
        payoutRecord.failureReason = flwTransfer.failureReason;
      }
      await payoutRecord.save();

      const transaction = await Transaction.create({
        type: 'Driver Payout',
        from: 'Connecta Platform Wallet',
        to: `${driver.name} (${bankName} - ${accountNumber})`,
        amount: amount,
        method: 'Bank Transfer',
        status: 'Pending',
        reference,
      });

      return res.status(200).json({
        success: true,
        message: `₦${amount.toLocaleString()} withdrawal queued for processing. Reference: ${reference}`,
        reference,
        status: 'PROCESSING',
        data: {
          transaction,
          availableBalance: updatedDriver.earnings.availableBalance,
          payout: payoutRecord,
        }
      });

    } else {
      // Explicit Failure -> Refund balance immediately
      payoutRecord.status = 'FAILED';
      payoutRecord.failureReason = flwTransfer.failureReason || 'Flutterwave transfer failed';
      await payoutRecord.save();

      await Driver.findByIdAndUpdate(driver._id, {
        $inc: { 'earnings.availableBalance': amount }
      });

      await Transaction.create({
        type: 'Driver Payout',
        from: 'Connecta Platform Wallet',
        to: `${driver.name} (${bankName} - ${accountNumber})`,
        amount: amount,
        method: 'Bank Transfer',
        status: 'Failed',
        reference,
      });

      return res.status(400).json({
        success: false,
        error: `Withdrawal failed: ${flwTransfer.failureReason || 'Declined by bank'}. Your balance has been restored.`,
        reference,
      });
    }
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

    // If order status is marked as 'delivered', update driver earnings in DB with 7-day maturity period
    if (status === 'delivered') {
      const driver = await Driver.findOne();
      if (driver) {
        const fee = order.deliveryFee || 850;
        const now = new Date();
        const eligibleAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from delivery

        if (!driver.earnings) driver.earnings = {};
        if (!driver.earnings.unpaidEarnings) driver.earnings.unpaidEarnings = [];

        driver.earnings.totalEarned = (driver.earnings.totalEarned || 0) + fee;
        driver.earnings.pendingBalance = (driver.earnings.pendingBalance || 0) + fee;
        driver.earnings.totalTrips = (driver.earnings.totalTrips || 0) + 1;
        driver.earnings.unpaidEarnings.push({
          amount: fee,
          orderId: order.orderId,
          earnedAt: now,
          eligibleAt: eligibleAt,
          status: 'pending',
        });

        driver.markModified('earnings');
        await driver.save();
      }

      // Update vendor earnings in DB for nightly settlement
      if (order.vendorId) {
        const Vendor = require('../models/Vendor');
        const vendor = await Vendor.findById(order.vendorId);
        if (vendor) {
          const totalAmt = Number(order.totalAmount || order.total || 0);
          const delFee = Number(order.deliveryFee || 0);
          const vendorShare = Math.max(0, totalAmt - delFee) || totalAmt;
          vendor.earnings = {
            ...(vendor.earnings?.toObject ? vendor.earnings.toObject() : vendor.earnings),
            availableBalance: (vendor.earnings?.availableBalance || 0) + vendorShare,
            weeklyRevenue: (vendor.earnings?.weeklyRevenue || 0) + vendorShare,
            totalOrders: (vendor.earnings?.totalOrders || 0) + 1,
          };
          vendor.markModified('earnings');
          await vendor.save();
        }
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
