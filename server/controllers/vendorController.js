const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const getCurrentVendor = async (req) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const vendor = await Vendor.findById(userId);
    if (vendor) return vendor;
  }
  if (userEmail) {
    const vendor = await Vendor.findOne({ email: userEmail });
    if (vendor) return vendor;
  }
  if (req.body && req.body.email) {
    const vendor = await Vendor.findOne({ email: req.body.email });
    if (vendor) return vendor;
  }
  if (req.body && req.body.vendorId && mongoose.Types.ObjectId.isValid(req.body.vendorId)) {
    const vendor = await Vendor.findById(req.body.vendorId);
    if (vendor) return vendor;
  }
  if (req.query && req.query.email) {
    const vendor = await Vendor.findOne({ email: req.query.email });
    if (vendor) return vendor;
  }
  return await Vendor.findOne();
};

// Get vendor dashboard data
const getVendorDashboard = async (req, res) => {
  try {
    let vendor = await getCurrentVendor(req);
    if (!vendor) {
      vendor = await Vendor.create({
        name: 'Demo Vendor',
        email: 'demo@vendor.com',
        businessName: "Mama's Kitchen",
        status: 'Approved'
      });
    }

    const allOrders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    const stats = {
      new: allOrders.filter(o => o.status === 'pending' || o.status === 'new').length,
      cooking: allOrders.filter(o => o.status === 'preparing').length,
      ready: allOrders.filter(o => o.status === 'ready').length,
    };

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayTotals = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    const dayOrders = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };

    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
      const dayIndex = orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1;
      const dayName = DAYS[dayIndex];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + (order.totalAmount || order.total || 0);
      dayOrders[dayName] = (dayOrders[dayName] || 0) + 1;
    });

    const barData = DAYS.map((day) => dayTotals[day]);
    const dailyBreakdown = DAYS.map((day) => ({
      day,
      orders: dayOrders[day],
      amount: dayTotals[day],
    }));

    const customData = {
      ...vendor.toObject(),
      storeOpen: vendor.status === 'Approved',
      earnings: {
        availableBalance: typeof vendor.earnings?.availableBalance === 'number' ? vendor.earnings.availableBalance : (totalRevenue || 248500),
        weeklyRevenue: vendor.earnings?.weeklyRevenue ?? totalRevenue,
        totalOrders: vendor.earnings?.totalOrders ?? allOrders.length,
        avgOrders: vendor.earnings?.avgOrders ?? Math.round(avgOrderValue),
      },
      stats,
      todayRevenue: totalRevenue,
      delivered: deliveredCount,
      lowStock: 0,
      barData,
      dailyBreakdown,
      recentOrders: allOrders.slice(0, 5).map(o => ({
        id: o.orderId || o._id.toString(),
        _id: o._id.toString(),
        orderId: o.orderId || o._id.toString(),
        customerName: o.customerName || 'Customer',
        itemsCount: o.items?.length || 1,
        items: o.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || '1x Order Items',
        amount: o.totalAmount || o.total || 0,
        status: o.status === 'pending' ? 'new' : o.status,
        createdAt: o.createdAt
      })),
      liveOrders: allOrders.slice(0, 10).map(o => ({
        id: o.orderId || o._id.toString(),
        _id: o._id.toString(),
        orderId: o.orderId || o._id.toString(),
        customer: o.customerName || 'Customer',
        phone: o.customerPhone || '+234800000000',
        address: o.address || o.deliveryAddress || '12 Marina Road, Lagos',
        itemsCount: o.items?.length || 1,
        items: o.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || '1x Order Items',
        rawItems: (o.items && o.items.length > 0) ? o.items : [{ name: 'Order Items', quantity: 1, price: o.totalAmount || o.total || 5000 }],
        amount: `₦${Number(o.totalAmount || o.total || 0).toLocaleString()}`,
        totalNumeric: o.totalAmount || o.total || 0,
        status: o.status === 'pending' ? 'new' : o.status,
        specialInstructions: o.specialInstructions || 'None',
        createdAt: o.createdAt
      }))
    };

    res.status(200).json({ success: true, data: customData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await getCurrentVendor(req);

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Format openingHours if it was submitted as an object map
    if (req.body.openingHours && !Array.isArray(req.body.openingHours) && typeof req.body.openingHours === 'object') {
      req.body.openingHours = Object.keys(req.body.openingHours).map(day => {
        const h = req.body.openingHours[day];
        return {
          day,
          hours: h?.isOpen ? `${h.openAt || '08:00'} - ${h.closeAt || '22:00'}` : 'Closed'
        };
      });
    }

    Object.assign(vendor, req.body);
    await vendor.save();
    res.status(200).json({ success: true, data: vendor, vendor });
  } catch (error) {
    console.error('Error in updateVendorProfile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }, { orderId: orderId }]
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const requestVendorPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const payoutAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || '').replace(/[^0-9.]/g, ''));
    if (!payoutAmount || isNaN(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid payout amount' });
    }
    if (payoutAmount < 5000) {
      return res.status(400).json({ success: false, error: 'Minimum payout is ₦5,000' });
    }

    const vendor = await getCurrentVendor(req);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const currentBalance = typeof vendor.earnings?.availableBalance === 'number'
      ? vendor.earnings.availableBalance
      : 248500;

    if (payoutAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance for payout. Available: ₦${currentBalance.toLocaleString()}`
      });
    }

    const bankName = vendor.payoutAccount?.bank || 'Access Bank';
    const accountNumber = vendor.payoutAccount?.accountNumber || '0123456789';
    const accountName = vendor.payoutAccount?.accountName || vendor.businessName || vendor.name;

    const { resolveBankCode, initiatePayoutTransfer } = require('../utils/payoutService');
    const bankCode = resolveBankCode(bankName, vendor.payoutAccount?.bankCode);
    const reference = `VND_TRF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const flwTransfer = await initiatePayoutTransfer({
      accountBank: bankCode,
      accountNumber: accountNumber,
      amount: payoutAmount,
      narration: `Denish Vendor Payout - ${vendor.businessName || vendor.name}`,
      reference: reference,
      recipientName: accountName,
    });

    // Deduct balance
    const newBalance = Math.max(0, currentBalance - payoutAmount);
    vendor.earnings = {
      ...(vendor.earnings?.toObject ? vendor.earnings.toObject() : vendor.earnings),
      availableBalance: newBalance,
    };
    vendor.markModified('earnings');
    await vendor.save();

    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.create({
      type: 'Vendor Payout',
      from: 'Denish Platform Wallet',
      to: `${vendor.businessName || vendor.name} (${bankName} - ${accountNumber})`,
      amount: payoutAmount,
      method: 'Bank Transfer',
      status: flwTransfer.status || 'Completed',
      reference: reference,
    });

    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'Payout Initiated 🎉',
        message: `Payout of ₦${payoutAmount.toLocaleString()} to ${bankName} (${accountNumber}) has been initiated. Ref: ${reference}`,
        type: 'payout',
        recipient: 'vendor',
        read: false,
      });
    } catch (notifErr) {
      console.warn('Vendor payout notification notice:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `₦${payoutAmount.toLocaleString()} payout initiated to ${bankName} (${accountNumber}).`,
      data: {
        transaction,
        availableBalance: newBalance,
        reference,
        mode: flwTransfer.mode,
      }
    });
  } catch (error) {
    console.error('requestVendorPayout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVendorTransactions = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find({ type: 'Vendor Payout' }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Vendor Notifications ────────────────────────────────────────────────
const getVendorNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      $or: [
        { recipient: { $in: ['vendor', 'all'] } },
        { recipient: { $exists: false } },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('getVendorNotifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── MARK Single Vendor Notification as Read ─────────────────────────────────
const markVendorNotificationRead = async (req, res) => {
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
    console.error('markVendorNotificationRead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── MARK ALL Vendor Notifications as Read ───────────────────────────────────
const markAllVendorNotificationsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { 
        $or: [
          { recipient: { $in: ['vendor', 'all'] } },
          { recipient: { $exists: false } },
          { recipient: null }
        ],
        read: false 
      },
      { read: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllVendorNotificationsRead error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  updateVendorProfile,
  updateVendorOrderStatus,
  requestVendorPayout,
  getVendorTransactions,
  getVendorNotifications,
  markVendorNotificationRead,
  markAllVendorNotificationsRead,
};
