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

    const allOrders = await Order.find({ vendorId: vendor._id });
    const stats = {
      new: allOrders.filter(o => o.status === 'new').length,
      cooking: allOrders.filter(o => o.status === 'preparing').length,
      ready: allOrders.filter(o => o.status === 'ready').length,
    };

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayTotals = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    const dayOrders = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };

    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
      const dayIndex = orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1;
      const dayName = DAYS[dayIndex];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + (order.amount || 0);
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
        availableBalance: vendor.earnings?.availableBalance ?? 0,
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
      liveOrders: allOrders.filter(o => o.status !== 'delivered'),
    };

    res.status(200).json({ success: true, data: customData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    const {
      businessName,
      address,
      phone,
      category,
      about,
      openingHours,
      payoutAccount,
      deliveryLocations,
      notifications,
      logoUrl,
      coverUrl,
      status,
    } = req.body;

    if (businessName) vendor.businessName = businessName;
    if (address) vendor.address = address;
    if (phone) vendor.phone = phone;
    if (category) vendor.category = category;
    if (about) vendor.about = about;
    if (openingHours) vendor.openingHours = openingHours;
    if (payoutAccount) vendor.payoutAccount = payoutAccount;
    if (deliveryLocations) vendor.deliveryLocations = deliveryLocations;
    if (notifications) vendor.notifications = notifications;
    if (logoUrl) vendor.logoUrl = logoUrl;
    if (coverUrl) vendor.coverUrl = coverUrl;
    if (status) vendor.status = status;

    await vendor.save();
    res.status(200).json({ success: true, data: vendor });
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

    if (!vendor.payoutAccount?.accountNumber || !vendor.payoutAccount?.bank) {
      return res.status(400).json({ success: false, error: 'Payout account is not configured' });
    }

    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.create({
      type: 'Vendor Payout',
      from: vendor.businessName || vendor.name || 'Vendor',
      to: `${vendor.payoutAccount.bank} (${vendor.payoutAccount.accountNumber})`,
      amount: payoutAmount,
      method: 'Bank Transfer',
      status: 'Pending',
      reference: `VND-PAYOUT-${Date.now()}`,
    });

    vendor.earnings = {
      ...vendor.earnings,
      availableBalance: currentBalance - payoutAmount,
    };
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
    const transactions = await Transaction.find({
      $or: [
        { from: vendor.businessName || vendor.name || '' },
        { to: { $regex: vendor.payoutAccount?.accountNumber || '', $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  updateVendorProfile,
  requestVendorPayout,
  getVendorTransactions,
};
