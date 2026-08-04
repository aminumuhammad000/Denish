const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

// Get vendor dashboard data
const getVendorDashboard = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      vendor = await Vendor.create({
        name: 'Demo Vendor',
        email: 'demo@vendor.com',
        businessName: "Mama's Kitchen",
        status: 'Approved'
      });
    }

    const allOrders = await Order.find().sort({ createdAt: -1 });
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
        availableBalance: vendor.earnings?.availableBalance ?? totalRevenue,
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
      }))
    };

    res.status(200).json({ success: true, data: customData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    Object.assign(vendor, req.body);
    await vendor.save();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
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
    const payoutAmount = Number(amount);
    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payout amount' });
    }

    const vendor = await Vendor.findOne();
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const currentBalance = vendor.earnings?.availableBalance ?? 0;
    if (payoutAmount > currentBalance) {
      return res.status(400).json({ success: false, error: 'Insufficient balance for payout' });
    }

    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.create({
      type: 'Vendor Payout',
      from: vendor.businessName || vendor.name || 'Vendor',
      to: `${vendor.payoutAccount?.bank || 'Bank'} (${vendor.payoutAccount?.accountNumber || '0000000000'})`,
      amount: payoutAmount,
      method: 'Bank Transfer',
      status: 'Completed',
      reference: `VND-PAYOUT-${Date.now()}`,
    });

    vendor.earnings = {
      ...vendor.earnings,
      availableBalance: Math.max(0, currentBalance - payoutAmount),
    };
    vendor.markModified('earnings');
    await vendor.save();

    res.status(200).json({ success: true, data: { transaction, availableBalance: vendor.earnings.availableBalance } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVendorTransactions = async (req, res) => {
  try {
    const vendor = await Vendor.findOne();
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

module.exports = {
  getVendorDashboard,
  updateVendorProfile,
  updateVendorOrderStatus,
  requestVendorPayout,
  getVendorTransactions,
};
